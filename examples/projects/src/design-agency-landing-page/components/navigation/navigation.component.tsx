import React from "react";
import "./navigation.component.css";

const Navigation: React.FC = () => {
  return (
    <nav id="root">
      <ul id="nav-list">
        <li id="nav-item-home">
          <a id="nav-link-home" href="/">
            Home
          </a>
        </li>
        <li id="nav-item-about">
          <a id="nav-link-about" href="/about">
            About
          </a>
        </li>
        <li id="nav-item-services">
          <a id="nav-link-services" href="/services">
            Services
          </a>
        </li>
        <li id="nav-item-portfolio">
          <a id="nav-link-portfolio" href="/portfolio">
            Portfolio
          </a>
        </li>
        <li id="nav-item-contact">
          <a id="nav-link-contact" href="/contact">
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
