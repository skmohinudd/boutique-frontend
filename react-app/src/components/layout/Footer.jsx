function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer__content">
        <p>
          © {new Date().getFullYear()} Boutique.
        </p>

        <p>
          React frontend connected to Product Catalog and Inventory
          microservices.
        </p>
      </div>
    </footer>
  );
}

export default Footer;