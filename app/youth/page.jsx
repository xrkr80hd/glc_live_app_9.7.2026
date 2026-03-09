import Link from "next/link";
import { getYouthPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture, youthBanner } = await getYouthPageContent();

  return (
    <section className="container stack-lg">
      <div className="hero youth-hero">
        {youthBanner.image_url ? (
          <img className="banner-image" src={youthBanner.image_url} alt={youthBanner.title} />
        ) : null}
        <p className="eyebrow">Liberty Youth</p>
        <h1>{youthBanner.title}</h1>
        <p>{youthBanner.subtitle}</p>
        {youthBanner.cta_url ? (
          <Link className="btn btn-solid" href={youthBanner.cta_url}>
            {youthBanner.cta_label || "Learn More"}
          </Link>
        ) : null}
      </div>

      <div className="cards">
        <article className="card">
          <h2>Youth Scripture of the Week</h2>
          <p className="scripture-ref">{youthScripture.reference}</p>
          <p>{youthScripture.verse_text}</p>
        </article>
        <article className="card">
          <h2>Youth Announcements</h2>
          <ul className="list">
            {youthAnnouncements.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
