import React from "react";
import Navigation from "~/components/navigation/navigation.component";

const Header: React.FC = () => {
  return (
    <header id="root">
      <div id="container">
        <div id="logo">
          <h1>DesignCo</h1>
        </div>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
