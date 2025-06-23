import React from "react";
import "./portfolio-preview.component.css";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

export interface PortfolioPreviewProps {
  portfolio: PortfolioItem[];
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ portfolio }) => {
  return (
    <section id="root">
      <div id="container">
        <div id="header">
          <h2 id="section-title">Featured Work</h2>
          <p id="section-subtitle">A selection of our recent projects</p>
        </div>
        <div id="portfolio-grid">
          {portfolio.map((item) => (
            <div key={item.id} id="portfolio-card">
              <div id="portfolio-image">
                <div id="image-placeholder">{item.category}</div>
              </div>
              <div id="portfolio-content">
                <span id="portfolio-category">{item.category}</span>
                <h3 id="portfolio-title">{item.title}</h3>
                <p id="portfolio-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div id="view-all">
          <a id="view-all-button" href="/portfolio">
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPreview;
