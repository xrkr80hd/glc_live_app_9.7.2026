import { ChurchSocialIcons } from "@/components/ChurchSocialIcons";

export function ChurchSiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-footer">
            <img className="footer-logo" src="/assets/logo.png" alt="Liberty Church logo" />
            <span className="brand-text">Liberty Church</span>
          </div>
          <p className="muted">
            &copy; <span id="year" /> Liberty Church. All rights reserved.
          </p>
          <p className="muted" style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.7 }}>
            Made with love by{" "}
            <a
              href="https://www.xrkr80hd.studio"
              target="_blank"
              rel="noopener"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              xrkr80hd designs
            </a>
          </p>
        </div>
        <div>
          <h4>Visit</h4>
          <address id="footerAddress">100 McKeithen Dr, Alexandria, LA 71303</address>
        </div>
        <div>
          <h4>Connect</h4>
          <ChurchSocialIcons />
        </div>
      </div>
    </footer>
  );
}
