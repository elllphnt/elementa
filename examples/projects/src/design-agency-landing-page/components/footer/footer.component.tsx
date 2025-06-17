import React from "react";

const Footer: React.FC = () => {
  return (
    <footer id="root">
      <div id="container">
        <div id="footer-content">
          <div id="company-info">
            <h3>DesignCo</h3>
            <p>Creating exceptional digital experiences</p>
          </div>
          <div id="contact-info">
            <h4>Contact</h4>
            <p>hello@designco.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
          <div id="social-links">
            <h4>Follow Us</h4>
            <div id="social-icons">
              <a href="#" aria-label="Twitter">
                Twitter
              </a>
              <a href="#" aria-label="Instagram">
                Instagram
              </a>
              <a href="#" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div id="copyright">
          <p>&copy; 2025 DesignCo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
