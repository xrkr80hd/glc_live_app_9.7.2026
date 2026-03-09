const statusMessage = {
  submitted: "Your prayer request was submitted. We are praying with you.",
  missing: "Please complete all required fields.",
  error: "There was a problem submitting your request. Please try again.",
  not_configured: "Supabase is not configured yet. Add environment keys and retry.",
};

export default function PrayerPage({ searchParams }) {
  const status = searchParams?.status;

  return (
    <section className="container stack-lg narrow">
      <h1>Prayer Request</h1>
      <p>Share your request and our team will pray with you.</p>

      {status && statusMessage[status] ? (
        <p className={`notice ${status === "submitted" ? "notice-success" : "notice-error"}`}>
          {statusMessage[status]}
        </p>
      ) : null}

      <form className="card form-grid" action="/api/prayer" method="post">
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" />
        </label>
        <label>
          Prayer Request
          <textarea name="request" rows="6" required />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="is_private" value="true" />
          Keep this request private
        </label>
        <button className="btn btn-solid" type="submit">
          Submit Request
        </button>
      </form>
    </section>
  );
}
