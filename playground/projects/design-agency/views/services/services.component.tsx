import React from "react";
import Layout from "../../components/layout/layout.component.js";
import useServices from "../../hooks/useServices.hook.js";
import "./services.component.css";

const Services: React.FC = () => {
  const { services, isLoading } = useServices();

  if (isLoading) {
    return (
      <Layout>
        <div id="loading">
          <div id="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="root">
        <section id="hero">
          <div id="hero-container">
            <h1 id="hero-title">Our Services</h1>
            <p id="hero-subtitle">
              Comprehensive design and strategy solutions to help your business
              thrive in the digital world.
            </p>
          </div>
        </section>

        <section id="services-section">
          <div id="services-container">
            {services.map((service) => (
              <div key={service.id} id="service-card">
                <div id="service-icon">{service.icon}</div>
                <div id="service-content">
                  <h2 id="service-title">{service.title}</h2>
                  <p id="service-description">{service.description}</p>
                  <ul id="service-features">
                    {service.features.map((feature, index) => (
                      <li key={index} id="service-feature">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div id="service-pricing">
                    <span id="price-label">Starting at</span>
                    <span id="price">{service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="process">
          <div id="process-container">
            <h2 id="process-title">Our Process</h2>
            <div id="process-steps">
              <div id="process-step">
                <div id="step-number">1</div>
                <h3 id="step-title">Discovery</h3>
                <p id="step-description">
                  We start by understanding your business, goals, and target
                  audience.
                </p>
              </div>
              <div id="process-step">
                <div id="step-number">2</div>
                <h3 id="step-title">Strategy</h3>
                <p id="step-description">
                  We develop a comprehensive strategy and roadmap for your
                  project.
                </p>
              </div>
              <div id="process-step">
                <div id="step-number">3</div>
                <h3 id="step-title">Design</h3>
                <p id="step-description">
                  We create beautiful, functional designs that align with your
                  brand.
                </p>
              </div>
              <div id="process-step">
                <div id="step-number">4</div>
                <h3 id="step-title">Development</h3>
                <p id="step-description">
                  We bring designs to life with clean, efficient code.
                </p>
              </div>
              <div id="process-step">
                <div id="step-number">5</div>
                <h3 id="step-title">Launch</h3>
                <p id="step-description">
                  We launch your project and provide ongoing support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;
