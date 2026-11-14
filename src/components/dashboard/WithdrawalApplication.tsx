"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { FundingForm } from "@/components/dashboard/Forms";
import { Button } from "@/components/ui/Button";

export function WithdrawalApplication() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Apply for Withdrawal
        </Button>
      ) : (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Withdrawal Application
            </h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-silver-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <FundingForm kind="withdrawal" />
        </div>
      )}
    </div>
  );
}