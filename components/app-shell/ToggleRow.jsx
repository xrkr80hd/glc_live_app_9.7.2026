"use client";

import { useState } from "react";

export function ToggleRow({ label, description, defaultOn = false }) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <div className="lc-toggle-row">
      <div className="lc-toggle-copy">
        <strong>{label}</strong>
        {description ? <span className="lc-muted">{description}</span> : null}
      </div>
      <button
        type="button"
        className={`lc-toggle-switch${enabled ? " is-on" : ""}`}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => setEnabled((current) => !current)}
      />
    </div>
  );
}