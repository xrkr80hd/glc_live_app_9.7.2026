export function YouthHero({ eyebrow, title, description, children }) {
  return (
    <section className="lc-youth-hero">
      <span className="lc-hero-eyebrow">{eyebrow}</span>
      <div className="lc-stack">
        <h1>{title}</h1>
        <p className="lc-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
