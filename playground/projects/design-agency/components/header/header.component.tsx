import React from "react";
import "./header.component.css";
import Navigation from "~/components/navigation/navigation.component.js";

const Header: React.FC = () => {
  return (
    <header id="root">
      <div id="container">
        <div id="logo">
          <h1 id="logo-text">DesignCo</h1>
        </div>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
