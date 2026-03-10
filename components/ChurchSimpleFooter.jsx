export function ChurchSimpleFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Service Times</h4>
            <p>
              Sundays @ 10:00 AM
              <br />
              Youth Devotion @ 9:20 AM
            </p>
          </div>
          <div className="footer-section">
            <h4>Location</h4>
            <p>
              100 McKeithen Dr
              <br />
              Alexandria, LA 71303
            </p>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://www.youtube.com/@GoLibertyChurch" target="_blank" rel="noopener">
                YouTube
              </a>
              <a href="https://www.facebook.com/GoLibertyChurch" target="_blank" rel="noopener">
                Facebook
              </a>
              <a href="https://www.instagram.com/golibertychurch/" target="_blank" rel="noopener">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Liberty Church. All rights reserved.</p>
          <p style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.7 }}>
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
      </div>
    </footer>
  );
}
