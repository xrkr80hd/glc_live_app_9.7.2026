import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { IconBible, IconChevronDown, IconInfoCircle } from "@tabler/icons-react";

export default function BeliefsPage() {
  return (
    <>
      <ChurchHeader active="beliefs" />

      <section className="page-hero">
        <div className="container">
          <h1>
            <span className="title-inline">
              <IconBible size={32} stroke={1.8} aria-hidden="true" />
              <span>Our Beliefs</span>
            </span>
          </h1>
          <p className="sub">
            Rooted in Scripture, centered on Jesus, and empowered by the Holy Spirit. Here&apos;s a clear, welcoming summary of what we believe.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="belief-accordion">
            <details className="belief-group" open>
              <summary className="belief-group-toggle">
                <span>God and His Word</span>
                <IconChevronDown className="belief-chevron-icon" size={18} stroke={1.9} aria-hidden="true" />
              </summary>
              <div className="belief-group-panel">
                <div className="beliefs-grid">
                  <article className="belief-card">
                    <h3>One God</h3>
                    <p className="muted">There is one God who eternally exists in three Persons: Father, Son, and Holy Spirit. (Matthew 28:19; Deuteronomy 6:4)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        We believe in the Trinity—one God existing in three distinct Persons: God the Father, God the Son (Jesus Christ), and God the Holy Spirit. Each
                        Person is fully God, yet there is only one God. This mystery is central to our faith and reflects the relational nature of God Himself.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>Scripture</h3>
                    <p className="muted">The Bible is God&apos;s inspired, infallible Word and our final authority for faith and life. (2 Timothy 3:16-17; 2 Peter 1:20-21)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        We believe the Bible, in its original manuscripts, is without error and fully trustworthy. It is God&apos;s revelation to humanity, written by human
                        authors under the inspiration of the Holy Spirit. Scripture is our ultimate guide for what we believe and how we live.
                      </p>
                    </details>
                  </article>
                </div>
              </div>
            </details>

            <details className="belief-group">
              <summary className="belief-group-toggle">
                <span>Salvation</span>
                <IconChevronDown className="belief-chevron-icon" size={18} stroke={1.9} aria-hidden="true" />
              </summary>
              <div className="belief-group-panel">
                <div className="beliefs-grid">
                  <article className="belief-card">
                    <h3>Jesus Christ</h3>
                    <p className="muted">Jesus is fully God and fully man, born of a virgin, lived sinlessly, died for our sins, and rose again. (John 1:1,14; 1 Corinthians 15:3-4)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        Jesus Christ is the second Person of the Trinity who became human while remaining fully divine. He lived a perfect, sinless life and voluntarily died
                        on the cross as the sacrifice for our sins. His resurrection from the dead proves His victory over sin and death, offering eternal life to all who
                        believe.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>Salvation by Grace</h3>
                    <p className="muted">We are saved by grace alone through faith alone in Christ alone—not by works. (Ephesians 2:8-9; Romans 3:23-24)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        Salvation is God&apos;s free gift, not something we earn. We are saved when we place our faith in Jesus Christ, trusting Him as our Lord and Savior. Good
                        works are the result of salvation, not the cause of it. Anyone can be saved by believing in Jesus—no matter their past.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>New Birth</h3>
                    <p className="muted">When we trust Christ, we are born again by the Holy Spirit and become new creations. (John 3:3; 2 Corinthians 5:17)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        Being "born again" means experiencing spiritual rebirth through the Holy Spirit. This isn&apos;t just turning over a new leaf—it&apos;s receiving new spiritual
                        life from God. The old life of sin is replaced with a new life in Christ, giving us both the desire and power to live for God.
                      </p>
                    </details>
                  </article>
                </div>
              </div>
            </details>

            <details className="belief-group">
              <summary className="belief-group-toggle">
                <span>Christian Life</span>
                <IconChevronDown className="belief-chevron-icon" size={18} stroke={1.9} aria-hidden="true" />
              </summary>
              <div className="belief-group-panel">
                <div className="beliefs-grid">
                  <article className="belief-card">
                    <h3>The Holy Spirit</h3>
                    <p className="muted">The Holy Spirit indwells every believer, empowering us for holy living and spiritual gifts. (1 Corinthians 12:7; Galatians 5:22-23)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        The Holy Spirit comes to live within every Christian at the moment of salvation. He guides us, teaches us truth, convicts us of sin, and empowers us
                        to live godly lives. The Spirit also gives spiritual gifts to believers for serving God and building up the church.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>The Church</h3>
                    <p className="muted">
                      The church is the body of Christ—all believers united together for worship, discipleship, and mission. (1 Corinthians 12:12-27; Matthew 28:19-20)
                    </p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        The church isn&apos;t just a building—it&apos;s the community of all people who have trusted Jesus as their Savior. We gather together to worship God, learn
                        from His Word, encourage one another, and share the gospel with the world. Every believer is an important part of this body.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>Baptism &amp; Communion</h3>
                    <p className="muted">
                      We practice believer&apos;s baptism by immersion and regular communion as acts of obedience and remembrance. (Matthew 28:19; 1 Corinthians 11:23-26)
                    </p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        Baptism is a public declaration of faith where a believer is immersed in water, symbolizing their death to sin and resurrection to new life in Christ.
                        Communion (the Lord&apos;s Supper) is a regular celebration where we remember Jesus&apos; sacrifice through bread and juice, looking forward to His return.
                      </p>
                    </details>
                  </article>
                </div>
              </div>
            </details>

            <details className="belief-group">
              <summary className="belief-group-toggle">
                <span>The Future</span>
                <IconChevronDown className="belief-chevron-icon" size={18} stroke={1.9} aria-hidden="true" />
              </summary>
              <div className="belief-group-panel">
                <div className="beliefs-grid">
                  <article className="belief-card">
                    <h3>Jesus&apos; Return</h3>
                    <p className="muted">Jesus will return personally and visibly to judge the living and the dead. (Acts 1:11; 2 Timothy 4:1)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        We believe Jesus Christ will return to earth in the same bodily form in which He ascended to heaven. His return will be visible to all and will mark
                        the final judgment of humanity. This blessed hope motivates us to live faithfully and share the gospel urgently.
                      </p>
                    </details>
                  </article>

                  <article className="belief-card">
                    <h3>Eternal Life</h3>
                    <p className="muted">Believers will enjoy eternal life with God; unbelievers will face eternal separation from Him. (John 3:36; Revelation 21:1-4)</p>
                    <details>
                      <summary>Learn More</summary>
                      <p>
                        Those who trust in Jesus Christ will spend eternity in the presence of God in the new heavens and new earth—a place of perfect joy, peace, and
                        fellowship. Those who reject Christ will face eternal separation from God. This reality underscores the urgency and importance of the gospel message.
                      </p>
                    </details>
                  </article>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconInfoCircle size={28} stroke={1.8} aria-hidden="true" />
              <span>Questions About Our Beliefs?</span>
            </span>
          </h2>
          <p className="sub">We&apos;d love to talk with you more about what we believe and answer any questions you might have.</p>
          <div className="cta-row">
            <a className="btn" href="/prayer">
              Contact Us
            </a>
            <a className="btn ghost" href="/sermons">
              Hear Our Teaching
            </a>
          </div>
        </div>
      </section>

      <ChurchSimpleFooter />
    </>
  );
}
