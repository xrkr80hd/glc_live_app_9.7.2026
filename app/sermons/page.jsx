import { SermonsClient } from "@/components/SermonsClient";
import { getSermonsContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SermonsPage() {
  const { source, videos } = await getSermonsContent();

  return (
    <section className="container stack-lg">
      <div className="section-head">
        <h1>Sermons</h1>
        <p>
          {source === "youtube"
            ? "Loaded from YouTube API."
            : "Showing your latest sermon content."}
        </p>
      </div>
      <article className="card">
        <h2>Archived Sermons (Staging)</h2>
        <p>
          Archived sermons are being staged in the site now. Final hosting/source wiring for
          the full local archive will be connected next.
        </p>
      </article>
      <SermonsClient videos={videos} />
    </section>
  );
}
