
"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, RefreshCw } from "lucide-react";

import {
  PageTitle,
  Table,
  Td,
  Badge,
  EmptyState,
} from "@/components/dashboard/ui";

import { InvestmentActions } from "@/components/admin/InvestmentActions";
import { money, dateTime } from "@/lib/format";

type Investment = {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  currentBalance?: number;
  amountRequested: number;
  amountApproved?: number;
  cryptoCurrency: string;
  cryptoNetwork: string;
  status: string;
  adminNotes?: string;
  payment?: {
    id?: string;
    providerPaymentId?: string;
    payAmount?: number;
    actuallyPaid?: number;
    priceAmount?: number;
    priceCurrency?: string;
    paymentStatus?: string;
    transactionHash?: string;
    paidAt?: string;
    createdAt?: string;
    payAddress?: string;
  } | null;
  createdAt: string;
};

type Withdrawal = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  currentBalance: number;
  amountMinor: number;
  currency: string;
  status: string;
  userNote?: string;
  reviewNote?: string;
  reviewedAt?: string | null;
  transaction?: {
    id: string;
    amountUSD: number;
    balanceBeforeUSD: number;
    balanceAfterUSD: number;
    status: string;
    description: string;
    createdAt: string;
  } | null;
  createdAt: string;
};

type Tab = "deposits" | "withdrawals";

export function InvestmentFundingManager() {
  const [activeTab, setActiveTab] = useState<Tab>("deposits");

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [investmentResponse, withdrawalResponse] =
        await Promise.all([
          fetch("/api/admin/investments", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/admin/funding/withdrawals", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

      const investmentData = await investmentResponse.json();
      const withdrawalData = await withdrawalResponse.json();

      if (!investmentResponse.ok) {
        throw new Error(
          investmentData.error || "Unable to fetch deposits."
        );
      }

      if (!withdrawalResponse.ok) {
        throw new Error(
          withdrawalData.error || "Unable to fetch withdrawals."
        );
      }

      setInvestments(investmentData.investments ?? []);
      setWithdrawals(withdrawalData.withdrawals ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load funding requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reviewWithdrawal = async (
    withdrawal: Withdrawal,
    status: "under_review" | "approved" | "rejected"
  ) => {
    if (processingId) return;

    let note = "";

    if (status === "rejected") {
      const reason = window.prompt(
        "Enter the reason for rejecting this withdrawal:"
      );

      if (reason === null) return;

      note = reason.trim();

      if (!note) {
        window.alert("A rejection reason is required.");
        return;
      }
    }

    if (
      status === "approved" &&
      !window.confirm(
        `Approve this withdrawal of ${money(
          withdrawal.amountMinor,
          withdrawal.currency
        )}?`
      )
    ) {
      return;
    }

    if (
      status === "under_review" &&
      !window.confirm("Move this withdrawal request under review?")
    ) {
      return;
    }

    setProcessingId(withdrawal.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/funding/withdrawals/${withdrawal.id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            ...(note ? { note } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update withdrawal request."
        );
      }

      await fetchData(false);

      window.alert(
        data.message || `Withdrawal ${status.replace("_", " ")} successfully.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
      window.alert(message);
    } finally {
      setProcessingId("");
    }
  };

  return (
    <>
      <PageTitle
        title="Deposits & Withdrawals"
        intro="Manage client investment deposits, verify cryptocurrency payments and review withdrawal requests."
      />

      {/* Tabs and refresh */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("deposits")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "deposits"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Deposits ({investments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "withdrawals"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Withdrawals ({withdrawals.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => fetchData(false)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-10 flex items-center justify-center py-16 text-sm text-slate-500">
          <RefreshCw size={18} className="mr-2 animate-spin" />
          Loading funding records...
        </div>
      ) : (
        <>
          {/* DEPOSITS */}
          {activeTab === "deposits" && (
            <div className="mt-6">
              {investments.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No investment applications"
                >
                  Client investment applications will appear here.
                </EmptyState>
              ) : (
                <Table
                  head={[
                    "Date",
                    "Client",
                    "Requested Amount",
                    "Cryptocurrency",
                    "Payment Status",
                    "Amount Received",
                    "Application Status",
                    "Actions",
                  ]}
                >
                  {investments.map((r) => {
                    const payment = r.payment;

                    return (
                      <tr key={r.id}>
                        <Td>
                          {dateTime(r.createdAt)}
                        </Td>

                        <Td>
                          <div className="font-medium">
                            {r.fullName ?? "Unknown user"}
                          </div>

                          <div className="text-xs text-slate-400">
                            {r.email ?? "—"}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            Balance:{" "}
                            {money(
                              Math.round(
                                (r.currentBalance ?? 0) * 100
                              ),
                              "USD"
                            )}
                          </div>
                        </Td>

                        <Td>
                          {money(
                            Math.round(r.amountRequested * 100),
                            "USD"
                          )}

                          {r.amountApproved !== undefined && (
                            <div className="mt-1 text-xs text-green-500">
                              Approved:{" "}
                              {money(
                                Math.round(r.amountApproved * 100),
                                "USD"
                              )}
                            </div>
                          )}
                        </Td>

                        <Td>
                          <div className="font-semibold">
                            {r.cryptoCurrency}
                          </div>

                          <div className="text-xs text-slate-400">
                            {r.cryptoNetwork}
                          </div>

                          {payment?.payAddress && (
                            <div
                              className="mt-1 break-all text-xs text-slate-400"
                              title={payment.payAddress}
                            >
                              Payment address:{" "}
                              {payment.payAddress.slice(0, 12)}...
                            </div>
                          )}
                        </Td>

                        <Td>
                          {payment ? (
                            <Badge
                              value={payment.paymentStatus ?? "unpaid"}
                            />
                          ) : (
                            <Badge value="unpaid" />
                          )}

                          {payment?.transactionHash && (
                            <div className="mt-1">
                              <a
                                href={`https://www.blockchain.com/explorer/search?search=${encodeURIComponent(
                                  payment.transactionHash
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 underline"
                              >
                                View transaction
                              </a>
                            </div>
                          )}
                        </Td>

                        <Td>
                          {payment ? (
                            <div>
                              <div>
                                {payment.actuallyPaid ?? 0}{" "}
                                {r.cryptoCurrency}
                              </div>

                              <div className="text-xs text-slate-400">
                                Expected: {payment.payAmount ?? 0}{" "}
                                {r.cryptoCurrency}
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </Td>

                        <Td>
                          <Badge value={r.status} />
                        </Td>

                        <Td>
                          <InvestmentActions
                            investmentId={r.id}
                            status={r.status}
                            amountRequested={r.amountRequested}
                            paymentStatus={
                              payment?.paymentStatus ?? "unpaid"
                            }
                            paidUsd={
                              payment?.paymentStatus === "finished"
                                ? payment.priceAmount ?? 0
                                : 0
                            }
                          />
                        </Td>
                      </tr>
                    );
                  })}
                </Table>
              )}
            </div>
          )}

          {/* WITHDRAWALS */}
          {activeTab === "withdrawals" && (
            <div className="mt-6">
              {withdrawals.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No withdrawal requests"
                >
                  Client withdrawal applications will appear here.
                </EmptyState>
              ) : (
                <Table
                  head={[
                    "Date",
                    "Client",
                    "Requested Amount",
                    "Balance",
                    "Transaction",
                    "Status",
                    "Review Note",
                    "Actions",
                  ]}
                >
                  {withdrawals.map((w) => {
                    const isProcessing = processingId === w.id;

                    const isFinal = [
                      "approved",
                      "rejected",
                    ].includes(w.status);

                    return (
                      <tr key={w.id}>
                        <Td>
                          {dateTime(w.createdAt)}
                        </Td>

                        <Td>
                          <div className="font-medium">
                            {w.fullName}
                          </div>

                          <div className="text-xs text-slate-400">
                            {w.email}
                          </div>

                          {w.phone && (
                            <div className="mt-1 text-xs text-slate-400">
                              {w.phone}
                            </div>
                          )}
                        </Td>

                        <Td>
                          <div className="font-semibold">
                            {money(w.amountMinor, w.currency)}
                          </div>

                          {w.userNote && (
                            <div className="mt-1 max-w-48 text-xs text-slate-400">
                              Note: {w.userNote}
                            </div>
                          )}
                        </Td>

                        <Td>
                          {money(
                            Math.round(w.currentBalance * 100),
                            "USD"
                          )}
                        </Td>

                        <Td>
                          {w.transaction ? (
                            <>
                              <Badge
                                value={w.transaction.status}
                              />

                              <div className="mt-1 text-xs text-slate-400">
                                {money(
                                  Math.round(
                                    w.transaction.amountUSD * 100
                                  ),
                                  "USD"
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No transaction found
                            </span>
                          )}
                        </Td>

                        <Td>
                          <Badge value={w.status} />
                        </Td>

                        <Td>
                          <div className="max-w-48 text-xs text-slate-500">
                            {w.reviewNote || "—"}
                          </div>

                          {w.reviewedAt && (
                            <div className="mt-1 text-xs text-slate-400">
                              {dateTime(w.reviewedAt)}
                            </div>
                          )}
                        </Td>

                        <Td>
                          {!isFinal ? (
                            <div className="flex min-w-36 flex-col gap-2">
                              {w.status === "pending" && (
                                <button
                                  type="button"
                                  disabled={isProcessing || !!processingId}
                                  onClick={() =>
                                    reviewWithdrawal(w, "under_review")
                                  }
                                  className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-400"
                                >
                                  Mark Under Review
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={isProcessing || !!processingId}
                                onClick={() =>
                                  reviewWithdrawal(w, "approved")
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing || !!processingId}
                                onClick={() =>
                                  reviewWithdrawal(w, "rejected")
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Processed
                            </span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </Table>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
