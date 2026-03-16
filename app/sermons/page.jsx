"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { sermonCards } from "@/lib/mobile-app-content";

const tabs = ["Latest", "Series", "Featured"];

export default function SermonsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedCardId, setSelectedCardId] = useState(sermonCards[0].id);
  const [query, setQuery] = useState("");

  const filteredCards = sermonCards.filter((item) => {
    const searchable = `${item.title} ${item.series} ${item.date}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  });

  return (
    <AppShell navKey="sermons" title="Sermons" subtitle="Browse recent messages, series, and featured teachings.">
      <BackRow fallbackHref="/" />

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Library</h2>
          <p className="lc-muted">Use search and tabs to move through the sermon library.</p>
        </div>
        <input
          className="lc-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sermons"
          aria-label="Search sermons"
        />
        <div className="lc-tab-row" role="tablist" aria-label="Sermon categories">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`lc-tab${activeTab === tab ? " is-selected" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="lc-stack">
        {filteredCards.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lc-announcement-card${selectedCardId === item.id ? " is-selected" : ""}`}
            onClick={() => setSelectedCardId(item.id)}
            aria-pressed={selectedCardId === item.id}
          >
            <div className="lc-announcement-meta">
              <span>{activeTab}</span>
              <span>{item.date}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="lc-muted">{item.series}</p>
            <span className="lc-announcement-cta">Open sermon</span>
          </button>
        ))}
      </section>
    </AppShell>
  );
}
