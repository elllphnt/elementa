import React from "react";
import "./service-preview.component.css";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ServicePreviewProps {
  services: Service[];
}

const ServicePreview: React.FC<ServicePreviewProps> = ({ services }) => {
  return (
    <section id="root">
      <div id="container">
        <div id="header">
          <h2 id="section-title">Our Services</h2>
          <p id="section-subtitle">
            We offer comprehensive design solutions to help your business grow
          </p>
        </div>
        <div id="services-grid">
          {services.length}
          {services?.map((service) => (
            <div key={service.id} id="service-card">
              <div id="service-icon">{service.icon}</div>
              <h3 id="service-title">{service.title}</h3>
              <p id="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicePreview;
