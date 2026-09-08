"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STATUS_LABELS = {
  new: "Submitted",
  reviewing: "Under Review",
  ordered: "Ordered",
  fulfilled: "Fulfilled",
  declined: "Declined",
};

function roleName(role) {
  return role?.name || role?.role_key?.replaceAll("_", " ") || "Ministry";
}

function requestRoleName(request) {
  return request?.role?.name || "Ministry";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function MinistryRequests() {
  const [requests, setRequests] = useState([]);
  const [submitRoles, setSubmitRoles] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canViewBudget, setCanViewBudget] = useState(false);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [draft, setDraft] = useState({ role_id: "", title: "", request_details: "", needed_by_date: "", estimated_cost: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const call = useCallback(async (init = {}) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase?.auth?.getSession?.() || { data: {} };
    const token = data?.session?.access_token;
    if (!token) throw new Error("Please sign in to manage ministry requests.");
    const response = await fetch("/api/member/order-requests", {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Request failed.");
    return payload;
  }, []);

  const load = useCallback(async () => {
    try {
      const payload = await call();
      const nextRequests = payload.requests || [];
      setRequests(nextRequests);
      setSubmitRoles(payload.submitRoles || []);
      setCanReview(Boolean(payload.canReview));
      setCanApprove(Boolean(payload.canApprove));
      setCanViewBudget(Boolean(payload.canViewBudget));
      setReviewDrafts(Object.fromEntries(nextRequests.map((request) => [request.id, {
        status: request.status || "new",
        pastor_notes: request.pastor_notes || "",
      }])));
      setDraft((current) => ({ ...current, role_id: current.role_id || payload.submitRoles?.[0]?.id || "" }));
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load ministry requests.");
    }
  }, [call]);

  useEffect(() => { load(); }, [load]);

  const openRequests = useMemo(() => requests.filter((request) => !["fulfilled", "declined"].includes(request.status)), [requests]);
  const closedRequests = useMemo(() => requests.filter((request) => ["fulfilled", "declined"].includes(request.status)), [requests]);

  function setField(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function setReviewField(requestId, name, value) {
    setReviewDrafts((current) => ({
      ...current,
      [requestId]: { ...(current[requestId] || {}), [name]: value },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!draft.role_id || !draft.title.trim() || !draft.request_details.trim() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await call({ method: "POST", body: JSON.stringify(draft) });
      setNotice("Request sent to church leadership.");
      setDraft((current) => ({ ...current, title: "", request_details: "", needed_by_date: "", estimated_cost: "" }));
      await load();
    } catch (submitError) {
      setError(submitError.message || "Unable to submit request.");
    } finally {
      setBusy(false);
    }
  }

  async function saveReview(requestId) {
    const review = reviewDrafts[requestId];
    if (!review || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await call({
        method: "PATCH",
        body: JSON.stringify({ request_id: requestId, status: review.status, pastor_notes: review.pastor_notes }),
      });
      setNotice("Ministry request updated.");
      await load();
    } catch (reviewError) {
      setError(reviewError.message || "Unable to update request.");
    } finally {
      setBusy(false);
    }
  }

  function RequestCard({ request }) {
    const review = reviewDrafts[request.id] || { status: request.status, pastor_notes: request.pastor_notes || "" };
    return (
      <article className="rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#2d7a53]">{requestRoleName(request)}</p>
            <h3 className="mt-1 font-bold text-[#173329]">{request.title}</h3>
            {request.requester ? <p className="mt-1 text-xs text-[#7a8d84]">Requested by {request.requester.full_name || request.requester.username}</p> : null}
          </div>
          <span className="rounded-full bg-[#e8f3ec] px-2.5 py-1 text-xs font-bold text-[#286b49]">{STATUS_LABELS[request.status] || request.status}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f7469]">{request.request_details}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#7a8d84]">
          {request.needed_by_date ? <span>Needed by {formatDate(request.needed_by_date)}</span> : null}
          {canViewBudget && request.estimated_cost != null ? <span>Estimated ${Number(request.estimated_cost).toFixed(2)}</span> : null}
        </div>
        {request.pastor_notes && !canReview ? <p className="mt-3 rounded-xl border border-[#cfe0d6] bg-white px-3 py-2 text-sm text-[#355b49]"><strong>Leadership note:</strong> {request.pastor_notes}</p> : null}

        {canReview ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-[#cfe0d6] bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#2d7a53]">Leadership Review</p>
            <label className="grid gap-1 text-sm font-semibold text-[#355b49]">
              Status
              <select value={review.status} onChange={(event) => setReviewField(request.id, "status", event.target.value)} className="h-10 rounded-lg border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">
                <option value="new">Submitted</option>
                <option value="reviewing">Under Review</option>
                {canApprove ? <option value="ordered">Ordered / Approved</option> : null}
                {canApprove ? <option value="fulfilled">Fulfilled</option> : null}
                {canApprove ? <option value="declined">Declined</option> : null}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#355b49]">
              Note to Ministry
              <textarea rows={3} value={review.pastor_notes} onChange={(event) => setReviewField(request.id, "pastor_notes", event.target.value)} placeholder="Optional update or instruction" className="rounded-lg border border-[#cdded4] bg-white px-3 py-2 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" />
            </label>
            <button type="button" onClick={() => saveReview(request.id)} disabled={busy} className="h-10 rounded-lg bg-[#1f6846] px-4 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">Save Review</button>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}

      {submitRoles.length ? (
        <section className="rounded-2xl border border-[#d7e4dc] bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Ministry Need</p>
          <h2 className="mt-1 text-2xl font-bold text-[#173329]">Send a Request</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f8379]">Use this for supplies, equipment, restocking, or another ministry need that leadership should know about.</p>

          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Ministry<select value={draft.role_id} onChange={(event) => setField("role_id", event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">{submitRoles.map((role) => <option key={role.id} value={role.id}>{roleName(role)}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">What is needed?<input value={draft.title} onChange={(event) => setField("title", event.target.value)} placeholder="Example: We are running low on outreach tracts" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Details<textarea value={draft.request_details} onChange={(event) => setField("request_details", event.target.value)} rows={5} placeholder="Tell leadership what is low, what you need, and anything else that helps." className="rounded-xl border border-[#cdded4] bg-white px-3 py-2.5 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Needed by (optional)<input type="date" value={draft.needed_by_date} onChange={(event) => setField("needed_by_date", event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Estimated cost (optional)<input inputMode="decimal" value={draft.estimated_cost} onChange={(event) => setField("estimated_cost", event.target.value)} placeholder="0.00" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            </div>
            <button disabled={busy || !draft.role_id || !draft.title.trim() || !draft.request_details.trim()} className="h-12 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">{busy ? "Sending…" : "Send Request"}</button>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#d7e4dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-bold text-[#173329]">{canReview ? "Ministry Requests Needing Attention" : "Current Requests"}</h2>
        <div className="mt-4 grid gap-3">
          {openRequests.map((request) => <RequestCard key={request.id} request={request} />)}
          {!openRequests.length ? <p className="rounded-xl border border-dashed border-[#cfded5] px-4 py-8 text-center text-sm text-[#71847b]">No open ministry requests.</p> : null}
        </div>
      </section>

      {closedRequests.length ? (
        <details className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-4 text-sm font-bold text-[#173329] sm:px-5">Completed & Closed Requests</summary>
          <div className="grid gap-3 border-t border-[#e3ece7] p-4 sm:p-5">
            {closedRequests.map((request) => <RequestCard key={request.id} request={request} />)}
          </div>
        </details>
      ) : null}
    </div>
  );
}
