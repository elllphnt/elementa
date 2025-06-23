import React from "react";
import ContactForm from "../../components/contact-form/contact-form.component.js";
import Layout from "../../components/layout/layout.component.js";
import "./contact.component.css";

const Contact: React.FC = () => {
  return (
    <Layout>
      <div id="root">
        <section id="hero">
          <div id="hero-container">
            <h1 id="hero-title">Get In Touch</h1>
            <p id="hero-subtitle">
              Ready to start your project? Let's discuss how we can help bring
              your vision to life.
            </p>
          </div>
        </section>

        <section id="contact-section">
          <div id="contact-container">
            <div id="contact-info">
              <h2 id="contact-info-title">Let's Start a Conversation</h2>
              <p id="contact-info-description">
                We'd love to hear about your project and discuss how we can
                help. Reach out to us and we'll get back to you within 24 hours.
              </p>

              <div id="contact-methods">
                <div id="contact-method">
                  <div id="contact-icon">📧</div>
                  <div id="contact-details">
                    <h3 id="contact-method-title">Email</h3>
                    <p id="contact-method-value">hello@designco.com</p>
                  </div>
                </div>

                <div id="contact-method">
                  <div id="contact-icon">📞</div>
                  <div id="contact-details">
                    <h3 id="contact-method-title">Phone</h3>
                    <p id="contact-method-value">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div id="contact-method">
                  <div id="contact-icon">📍</div>
                  <div id="contact-details">
                    <h3 id="contact-method-title">Office</h3>
                    <p id="contact-method-value">
                      123 Design Street
                      <br />
                      Creative District, CD 12345
                    </p>
                  </div>
                </div>
              </div>

              <div id="social-section">
                <h3 id="social-title">Follow Us</h3>
                <div id="social-links">
                  <a id="social-link" href="#" aria-label="Twitter">
                    Twitter
                  </a>
                  <a id="social-link" href="#" aria-label="Instagram">
                    Instagram
                  </a>
                  <a id="social-link" href="#" aria-label="LinkedIn">
                    LinkedIn
                  </a>
                  <a id="social-link" href="#" aria-label="Dribbble">
                    Dribbble
                  </a>
                </div>
              </div>
            </div>

            <div id="form-section">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;
