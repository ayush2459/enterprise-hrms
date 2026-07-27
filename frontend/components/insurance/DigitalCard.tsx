"use client";

import { Download, ShieldCheck } from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface DigitalCardProps {
  policy: InsurancePolicy;
  holderName: string;
  cardId: string;
  relationship?: string;
}

function buildCardHtml(props: DigitalCardProps) {
  const { policy, holderName, cardId, relationship } = props;
  return `
    <html>
      <head>
        <title>Insurance Card - ${holderName}</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; background: #f7f8fa; }
          .card { max-width: 420px; margin: 0 auto; border-radius: 16px; padding: 24px;
                  background: linear-gradient(135deg, #3A66DB, #1A1A1F); color: white; }
          .label { font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
          .value { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
          .row { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="label">Health Insurance Card</div>
          <div class="value" style="font-size: 20px; margin-top: 4px;">${holderName}</div>
          ${relationship ? `<div class="label">Relationship</div><div class="value">${relationship}</div>` : ""}
          <div class="row">
            <div>
              <div class="label">Policy Number</div>
              <div class="value">${policy.policy_number}</div>
            </div>
            <div>
              <div class="label">Card ID</div>
              <div class="value">${cardId}</div>
            </div>
          </div>
          <div class="row">
            <div>
              <div class="label">Insurer</div>
              <div class="value">${policy.insurer_name}</div>
            </div>
            <div>
              <div class="label">Sum Insured</div>
              <div class="value">₹${policy.sum_insured.toLocaleString()}</div>
            </div>
          </div>
          <div class="label">Valid</div>
          <div class="value">${policy.valid_from} to ${policy.valid_to}</div>
        </div>
      </body>
    </html>
  `;
}

export function DigitalCard(props: DigitalCardProps) {
  const { policy, holderName, cardId, relationship } = props;

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(buildCardHtml(props));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-70">Health Insurance Card</p>
          <p className="mt-1 text-lg font-semibold">{holderName}</p>
          {relationship && <p className="text-xs capitalize opacity-70">{relationship}</p>}
        </div>
        <ShieldCheck size={22} className="opacity-80" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs opacity-60">Policy Number</p>
          <p className="font-medium">{policy.policy_number}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Card ID</p>
          <p className="font-medium">{cardId}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Insurer</p>
          <p className="font-medium">{policy.insurer_name}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Sum Insured</p>
          <p className="font-medium">₹{policy.sum_insured.toLocaleString()}</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
      >
        <Download size={14} />
        Download Card
      </button>
    </div>
  );
}
