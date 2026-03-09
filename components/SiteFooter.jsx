export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Liberty Church</h3>
          <p>1148 MacArthur Drive, Alexandria, LA</p>
          <p>Sunday Service: 10:00 AM</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: info@golibertychurch.com</p>
          <p>Phone: (318) 555-0000</p>
        </div>
      </div>
      <p className="copyright">
        &copy; {new Date().getFullYear()} Liberty Church. All rights reserved.
      </p>
    </footer>
  );
}
