"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { IconHeartDollar } from "@tabler/icons-react";

const funds = ["Tithe", "Offering", "Mission / Other"];
const amounts = ["$25", "$50", "$100", "$250", "Custom"];
const frequencies = ["One Time", "Weekly", "Monthly"];
const methods = ["Card", "Bank Transfer"];

export default function GivePage() {
  const [selectedFund, setSelectedFund] = useState(funds[0]);
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0]);
  const [selectedMethod, setSelectedMethod] = useState(methods[0]);

  return (
    <AppShell navKey="more" title="Give" subtitle="Choose a fund, amount, and giving frequency.">
      <BackRow fallbackHref="/more" />

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Giving Setup</h2>
          <p className="lc-muted">Review giving details before online payment is connected.</p>
        </div>

        <div className="lc-stack">
          <div>
            <div className="lc-field-label">Fund</div>
            <div className="lc-choice-grid">
              {funds.map((fund) => (
                <button
                  key={fund}
                  type="button"
                  className={`lc-choice-chip${selectedFund === fund ? " is-selected" : ""}`}
                  onClick={() => setSelectedFund(fund)}
                >
                  {fund}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="lc-field-label">Amount</div>
            <div className="lc-amount-grid">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`lc-choice-chip${selectedAmount === amount ? " is-selected" : ""}`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="lc-field-label">Frequency</div>
            <div className="lc-choice-grid">
              {frequencies.map((frequency) => (
                <button
                  key={frequency}
                  type="button"
                  className={`lc-choice-chip${selectedFrequency === frequency ? " is-selected" : ""}`}
                  onClick={() => setSelectedFrequency(frequency)}
                >
                  {frequency}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="lc-field-label">Payment Method</div>
            <div className="lc-choice-grid">
              {methods.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`lc-choice-chip${selectedMethod === method ? " is-selected" : ""}`}
                  onClick={() => setSelectedMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="lc-card alt flat">
            <div className="lc-announcement-meta">
              <IconHeartDollar size={16} stroke={1.8} />
              <span>Online payment steps can be connected here when giving is enabled.</span>
            </div>
          </div>

          <button type="button" className="lc-action-btn primary">
            Continue to Payment
          </button>
        </div>
      </section>
    </AppShell>
  );
}
