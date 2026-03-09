const statusMessage = {
  submitted: "Thanks for planning your visit. We will follow up soon.",
  missing: "Please complete all required fields.",
  error: "There was a problem submitting your visit request. Please try again.",
  not_configured: "Supabase is not configured yet. Add environment keys and retry.",
};

export default function VisitPage({ searchParams }) {
  const status = searchParams?.status;

  return (
    <section className="container stack-lg narrow">
      <h1>Plan a Visit</h1>
      <p>Tell us a little about your family and we will make your first visit easy.</p>

      {status && statusMessage[status] ? (
        <p className={`notice ${status === "submitted" ? "notice-success" : "notice-error"}`}>
          {statusMessage[status]}
        </p>
      ) : null}

      <form className="card form-grid" action="/api/visit" method="post">
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
          Preferred Service
          <input type="text" name="preferred_service" placeholder="Sunday 10:00 AM" />
        </label>
        <label>
          Party Size
          <input type="number" min="1" step="1" name="party_size" defaultValue="1" />
        </label>
        <label>
          Message
          <textarea name="message" rows="5" />
        </label>
        <button className="btn btn-solid" type="submit">
          Submit Visit Request
        </button>
      </form>
    </section>
  );
}
