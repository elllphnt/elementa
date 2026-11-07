import React from "react";
import "./call-to-action.component.css";

const CallToAction: React.FC = () => {
  return (
    <section id="root">
      <div id="container">
        <div id="content">
          <h2 id="title">Ready to Start Your Project?</h2>
          <p id="description">
            Let's collaborate to bring your vision to life. Get in touch with us
            today and let's discuss how we can help you achieve your goals.
          </p>
          <div id="buttons">
            <a id="primary-button" href="/contact">
              Get Started
            </a>
            <a id="secondary-button" href="/portfolio">
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
