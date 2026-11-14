
"use client";

import { useState } from "react";
import { ArrowDownToLine, X } from "lucide-react";
import { WithdrawalApplication } from "@/components/dashboard/WithdrawalApplication";

export function WithdrawalSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-5">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <ArrowDownToLine size={18} />
          Apply for Withdrawal
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Withdrawal Application
            </h3>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close withdrawal form"
            >
              <X size={20} />
            </button>
          </div>

          <WithdrawalApplication />
        </div>
      )}
    </div>
  );
}
