const Footer = () => {
  return (
    <footer className="footer">
      ©{" "}
      <a href="https://tea-counter-frontend.vercel.app/">
        {new Date().getFullYear()}
      </a>{" "}
      <a href="https://tea-counter-frontend.vercel.app/">
         Tea Counter
      </a>{" "}
      | All Rights Reserved
    </footer>
  );
};

export default Footer;