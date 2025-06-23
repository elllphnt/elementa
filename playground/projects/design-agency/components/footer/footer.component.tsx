import React from "react";

const Footer: React.FC = () => {
  return (
    <footer id="root">
      <div id="container">
        <div id="footer-content">
          <div id="company-info">
            <h3 id="company-name">DesignCo</h3>
            <p id="company-description">
              Creating exceptional digital experiences
            </p>
          </div>
          <div id="contact-info">
            <h4 id="contact-title">Contact</h4>
            <p id="contact-email">hello@designco.com</p>
            <p id="contact-phone">+1 (555) 123-4567</p>
          </div>
          <div id="social-links">
            <h4 id="social-title">Follow Us</h4>
            <div id="social-icons">
              <a id="social-twitter" href="#" aria-label="Twitter">
                Twitter
              </a>
              <a id="social-instagram" href="#" aria-label="Instagram">
                Instagram
              </a>
              <a id="social-linkedin" href="#" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div id="copyright">
          <p id="copyright-text">&copy; 2025 DesignCo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
