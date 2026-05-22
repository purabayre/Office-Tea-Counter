const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        © {new Date().getFullYear()} Tea Counter | All Rights Reserved
      </div>

      <a
        href="https://aptechsolutions.io/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Aptech Solutions website"
        className="footer-company"
      >
        <img
          src="/footer-logo3.svg"
          alt="Aptech Solutions Logo"
          className="company-logo"
          loading="lazy"
        />
      </a>
    </footer>
  );
};

export default Footer;
