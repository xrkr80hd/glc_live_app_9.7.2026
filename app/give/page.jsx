import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";
import { IconHeartDollar, IconMail } from "@tabler/icons-react";

export default function GivePage() {
  return (
    <>
      <ChurchHeader active="give" />

      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h1>
                <span className="title-inline">
                  <IconHeartDollar size={32} stroke={1.8} aria-hidden="true" />
                  <span>Give</span>
                </span>
              </h1>
              <p className="muted">Thank you for partnering with Liberty Church.</p>
            </div>
            <div className="give-card">
              <h3 className="give-card-title">Online Giving is coming soon</h3>
              <p className="muted">
                We&apos;re setting up our secure giving platform now. Please check back shortly. Thank you for your generosity!
              </p>
              <a id="giveEmailLink" className="btn" href="mailto:give@golibertychurch.com?subject=Giving%20Information">
                <IconMail size={18} stroke={1.9} aria-hidden="true" />
                Email our team
              </a>
            </div>
          </div>
        </section>
      </main>

      <ChurchSiteFooter />
    </>
  );
}
