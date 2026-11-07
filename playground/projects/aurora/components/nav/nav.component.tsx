import React from "react";
import "./nav.component.css";

const Nav: React.FC = () => {
  return (
    <header id="root">
      <nav id="bar">
        <a id="brand" href="/">
          <span id="brand-mark"></span>
          <span id="brand-name">Aurora</span>
        </a>
        <div id="links">
          <a id="link-product" href="/product">Product</a>
          <a id="link-customers" href="/customers">Customers</a>
          <a id="link-pricing" href="/pricing">Pricing</a>
          <a id="link-docs" href="/docs">Docs</a>
        </div>
        <div id="actions">
          <a id="sign-in" href="/login">Sign in</a>
          <a id="cta" href="/signup">Start free</a>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
