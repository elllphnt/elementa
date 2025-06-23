import React from "react";
import Footer from "../footer/footer.component.js";
import Header from "../header/header.component.js";
import "./layout.component.css";

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div id="root" className={className}>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
