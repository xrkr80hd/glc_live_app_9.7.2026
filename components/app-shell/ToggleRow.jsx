"use client";

import { useState } from "react";

export function ToggleRow({ label, description, defaultOn = false }) {
  const [enabled, setEnabled] = useState(defaultOn);
  const stateLabel = enabled ? "On" : "Off";

  return (
    <div className="lc-toggle-row">
      <div className="lc-toggle-copy">
        <strong>{label}</strong>
        {description ? <span className="lc-muted">{description}</span> : null}
      </div>
      <div className="lc-toggle-control">
        <span className={`lc-toggle-state${enabled ? " is-on" : ""}`} aria-hidden="true">
          {stateLabel}
        </span>
        <button
          type="button"
          className={`lc-toggle-switch${enabled ? " is-on" : ""}`}
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          onClick={() => setEnabled((current) => !current)}
        />
      </div>
    </div>
  );
}
