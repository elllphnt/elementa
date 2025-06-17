import React from "react";
import Layout from "../../components/layout/layout.component";
import usePortfolio from "../../hooks/usePortfolio.hook";
import "./portfolio.component.css";

const Portfolio: React.FC = () => {
  const {
    portfolio,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
  } = usePortfolio();

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
            <h1 id="hero-title">Our Portfolio</h1>
            <p id="hero-subtitle">
              Discover our latest projects and see how we've helped businesses
              transform their digital presence.
            </p>
          </div>
        </section>

        <section id="portfolio-section">
          <div id="portfolio-container">
            <div id="filter-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  id="filter-tab"
                  className={selectedCategory === category ? "active" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div id="portfolio-grid">
              {portfolio.map((item) => (
                <div key={item.id} id="portfolio-item">
                  <div id="portfolio-image">
                    <div id="image-placeholder">{item.category}</div>
                    <div id="portfolio-overlay">
                      <h3 id="portfolio-item-title">{item.title}</h3>
                      <p id="portfolio-item-category">{item.category}</p>
                      <button id="view-project">View Project</button>
                    </div>
                  </div>
                  <div id="portfolio-info">
                    <h3 id="portfolio-title">{item.title}</h3>
                    <p id="portfolio-description">{item.description}</p>
                    <div id="portfolio-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} id="portfolio-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Portfolio;
