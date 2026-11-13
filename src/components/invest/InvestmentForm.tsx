
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Field,
  Button,
  Alert,
  Loader2,
} from "@/components/dashboard/ui";
import Image from "next/image";

type CryptoCurrency = "BTC" | "ETH" | "TRX" | "BNB" | "USDT";

type CryptoNetwork =
  | "BITCOIN"
  | "ETHEREUM"
  | "TRON"
  | "BSC";

type InvestmentResponse = {
  message: string;
  investment: {
    id: string;
    amountRequested: number;
    cryptoCurrency: CryptoCurrency;
    cryptoNetwork: CryptoNetwork;
    status: string;
  };
};

type PaymentResponse = {
  message: string;
  payment: {
    id: string;
    address: string;
    amount: number;
    currency: string;
    network: string;
    status: string;
    expiresAt: string;
  };
};

type PaymentDetails = PaymentResponse["payment"];

const cryptoOptions: {
  code: CryptoCurrency;
  name: string;
  symbol: string;
  description: string;
  selectedColor: string;
  networks: {
    value: CryptoNetwork;
    label: string;
  }[];
}[] = [
  {
    code: "BTC",
    name: "Bitcoin",
    symbol: "₿",
    description: "Bitcoin Network",
    selectedColor: "border-orange-500 bg-orange-500/10",
    networks: [
      { value: "BITCOIN", label: "Bitcoin Network" },
    ],
  },
  {
    code: "ETH",
    name: "Ethereum",
    symbol: "Ξ",
    description: "Ethereum Network",
    selectedColor: "border-indigo-500 bg-indigo-500/10",
    networks: [
      { value: "ETHEREUM", label: "Ethereum (ERC20)" },
    ],
  },
  {
    code: "TRX",
    name: "TRON",
    symbol: "◎",
    description: "TRON Network",
    selectedColor: "border-red-500 bg-red-500/10",
    networks: [
      { value: "TRON", label: "TRON Network (TRC20)" },
    ],
  },
  {
    code: "BNB",
    name: "BNB",
    symbol: "◆",
    description: "BNB Smart Chain",
    selectedColor: "border-yellow-500 bg-yellow-500/10",
    networks: [
      { value: "BSC", label: "BNB Smart Chain (BEP20)" },
    ],
  },
  {
    code: "USDT",
    name: "Tether",
    symbol: "₮",
    description: "Choose your USDT network",
    selectedColor: "border-green-500 bg-green-500/10",
    networks: [
      { value: "TRON", label: "TRON (TRC20)" },
      { value: "ETHEREUM", label: "Ethereum (ERC20)" },
      { value: "BSC", label: "BNB Smart Chain (BEP20)" },
    ],
  },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function InvestmentForm() {
  const [cryptoCurrency, setCryptoCurrency] =
    useState<CryptoCurrency>("BTC");

  const [cryptoNetwork, setCryptoNetwork] =
    useState<CryptoNetwork>("BITCOIN");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedCrypto = cryptoOptions.find(
    (crypto) => crypto.code === cryptoCurrency
  )!;

  function handleCurrencyChange(currency: CryptoCurrency) {
    setCryptoCurrency(currency);

    const selected = cryptoOptions.find(
      (crypto) => crypto.code === currency
    )!;

    setCryptoNetwork(selected.networks[0].value);
  }

  // Generate QR code for the deposit address.
  useEffect(() => {
    if (!payment?.address) {
      setQrCode("");
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(payment.address, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setQrCode(url);
      })
      .catch((err) => {
        console.error("QR generation error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [payment?.address]);

  // Countdown based on the server-provided expiry timestamp.
  useEffect(() => {
    if (!payment?.expiresAt) return;

    const updateCountdown = () => {
      const difference =
        new Date(payment.expiresAt).getTime() - Date.now();

      setRemainingTime(
        Math.max(0, Math.floor(difference / 1000))
      );
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [payment?.expiresAt]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setError("");
    setSuccess("");
    setPayment(null);

    try {
      const form = new FormData(e.currentTarget);

      const payload = {
        amountRequested: Number(form.get("amountRequested")),
        cryptoCurrency,
        cryptoNetwork,
      };

      if (
        !Number.isFinite(payload.amountRequested) ||
        payload.amountRequested <= 0
      ) {
        throw new Error("Enter a valid investment amount.");
      }

      // Step 1: Create investment application.
      const investmentRes = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const investmentData =
        (await investmentRes.json()) as
          | InvestmentResponse
          | { error?: string };

      if (!investmentRes.ok) {
        throw new Error(
          "error" in investmentData
            ? investmentData.error || "Unable to create investment."
            : "Unable to create investment."
        );
      }

      if (!("investment" in investmentData)) {
        throw new Error("Invalid investment response.");
      }

      const investmentId = investmentData.investment.id;

      if (!investmentId) {
        throw new Error("Investment ID was not returned.");
      }

      // Step 2: Create NOWPayments payment.
      const paymentRes = await fetch(
        `/api/investments/${investmentId}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const paymentData =
        (await paymentRes.json()) as
          | PaymentResponse
          | { error?: string };

      if (!paymentRes.ok) {
        throw new Error(
          "error" in paymentData
            ? paymentData.error || "Unable to create payment."
            : "Unable to create payment."
        );
      }

      if (!("payment" in paymentData)) {
        throw new Error("Invalid payment response.");
      }

      setPayment(paymentData.payment);
      setSuccess("Your payment instructions are ready.");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    if (!payment?.address) return;

    try {
      await navigator.clipboard.writeText(payment.address);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy address. Please copy it manually.");
    }
  }

  // Payment instructions screen.
  if (payment) {
    const expired = remainingTime <= 0;

    return (
      <div className="card max-w-xl space-y-6 p-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>

          <h2 className="mt-4 text-xl font-bold">
            Payment Instructions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Send the exact amount below to complete your payment.
          </p>
        </div>

        {success && <Alert kind="success">{success}</Alert>}

        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">
            Amount to send
          </p>

          <p className="mt-2 text-3xl font-bold">
            {payment.amount} {payment.currency}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {payment.network}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">
            Deposit Address
          </p>

          <div className="break-all rounded-xl border bg-gray-50 p-4 text-sm">
            {payment.address}
          </div>

          <Button
            type="button"
            onClick={copyAddress}
            disabled={expired}
          >
            {copied ? "Address Copied!" : "Copy Deposit Address"}
          </Button>
        </div>

        {qrCode && (
          <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
            <p className="text-sm font-semibold">
              Scan to Pay
            </p>

            <Image
              src={qrCode}
              alt="Cryptocurrency deposit QR code"
              width={240}
              height={240}
              className="rounded-lg"
            />

            <p className="text-xs text-gray-500">
              Scan this code with your wallet.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            {expired ? "Payment deadline reached" : "Payment expires in"}
          </p>

          <p className="mt-2 text-3xl font-bold tabular-nums text-amber-900">
            {formatTime(remainingTime)}
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-800">
            {expired
              ? "The payment deadline has passed. Do not send funds to this address without contacting support."
              : "Complete your transfer before the displayed deadline. Payments received after the deadline may require manual review."}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p>
            <strong>Currency:</strong> {payment.currency}
          </p>
          <p className="mt-1">
            <strong>Network:</strong> {payment.network}
          </p>
          <p className="mt-1">
            <strong>Payment status:</strong> {payment.status}
          </p>
        </div>

        <p className="text-center text-xs leading-5 text-gray-500">
          Your payment will be verified automatically after the
          payment provider notifies Trust Chain. Do not close this
          page expecting the payment to be confirmed immediately.
        </p>
      </div>
    );
  }

  // Investment form.
  return (
    <form
      className="card max-w-xl space-y-6 p-6"
      onSubmit={handleSubmit}
    >
      {error && <Alert kind="error">{error}</Alert>}

      {success && <Alert kind="success">{success}</Alert>}

      <Field
        label="Investment Amount (USD)"
        name="amountRequested"
        type="number"
        step="0.01"
        min="0.01"
        required
      />

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold">
            Select Payment Cryptocurrency
          </label>

          <p className="mt-1 text-xs text-gray-500">
            Choose the cryptocurrency you want to use.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cryptoOptions.map((crypto) => {
            const isSelected = cryptoCurrency === crypto.code;

            return (
              <button
                key={crypto.code}
                type="button"
                onClick={() => handleCurrencyChange(crypto.code)}
                aria-pressed={isSelected}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? crypto.selectedColor
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-3xl">{crypto.symbol}</div>

                <div className="mt-2 font-semibold">
                  {crypto.name}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {crypto.code}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {crypto.description}
                </div>

                {isSelected && (
                  <div className="mt-3 text-xs font-semibold text-green-600">
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="cryptoNetwork"
          className="block text-sm font-semibold"
        >
          Select Payment Network
        </label>

        <select
          id="cryptoNetwork"
          value={cryptoNetwork}
          onChange={(e) =>
            setCryptoNetwork(e.target.value as CryptoNetwork)
          }
          className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-green-500"
        >
          {selectedCrypto.networks.map((network) => (
            <option key={network.value} value={network.value}>
              {network.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Your selected payment method
        </p>

        <p className="mt-1 font-semibold">
          {selectedCrypto.name} ({cryptoCurrency})
        </p>

        <p className="text-sm text-gray-500">
          {
            selectedCrypto.networks.find(
              (network) => network.value === cryptoNetwork
            )?.label
          }
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        Only send funds using the selected cryptocurrency and
        network. Sending funds through an unsupported network may
        result in permanent loss.
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : null}

        {busy ? "Preparing Payment..." : "Continue to Payment"}
      </Button>
    </form>
  );
}
