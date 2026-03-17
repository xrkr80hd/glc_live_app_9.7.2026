"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";

const funds = ["Tithe", "Offering", "Mission / Other"];
const frequencies = ["One Time", "Weekly", "Monthly"];

export default function GivePage() {
  const [selectedFund, setSelectedFund] = useState(funds[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0]);

  return (
    <AppShell navKey="more" title="Give" subtitle="Choose a fund and give.">
      <BackRow fallbackHref="/member" />

      <section className="lc-card lc-give-card">
        <div className="lc-section-head">
          <h2>Giving Setup</h2>
          <p className="lc-muted">Simple giving setup while Stripe is being connected.</p>
        </div>

        <div className="lc-stack lc-give-stack">
          <MemberAccordion title="Fund" description={`Selected: ${selectedFund}`}>
            <div className="lc-choice-grid lc-give-choice-grid">
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
          </MemberAccordion>

          <div>
            <div className="lc-field-label">Frequency</div>
            <div className="lc-frequency-options" role="radiogroup" aria-label="Frequency">
              {frequencies.map((frequency) => {
                const isSelected = selectedFrequency === frequency;

                return (
                  <label key={frequency} className={`lc-frequency-option${isSelected ? " is-selected" : ""}`}>
                    <span>{frequency}</span>
                    <input
                      type="checkbox"
                      className="lc-frequency-checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedFrequency(frequency)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <button type="button" className="lc-action-btn primary">
            Continue to Stripe
          </button>

          <p className="lc-muted">Amount and payment method will be set inside Stripe checkout.</p>
        </div>
      </section>
    </AppShell>
  );
}
