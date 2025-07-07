import React from "react";
import Hero from "../../components/hero/hero.component.js";
import Layout from "../../components/layout/layout.component.js";
import ServicePreview from "../../components/service-preview/service-preview.component.js";
import useHomeData from "../../hooks/useHomeData.hook.js";
import "./home.component.css";

const Home: React.FC = () => {
  const { hero, services, portfolio, isLoading } = useHomeData();

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
        <Hero data={hero} />
        <pre>
          {JSON.stringify(
            {
              hero,
              services,
              portfolio,
              isLoading,
            },
            null,
            2
          )}
        </pre>
        <ServicePreview services={services} />
        {/* <PortfolioPreview portfolio={portfolio} /> */}
        {/* <CallToAction /> */}
      </div>
    </Layout>
  );
};

export default Home;
