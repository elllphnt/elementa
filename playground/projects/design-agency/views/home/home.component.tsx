import React from "react";
import CallToAction from "../../components/call-to-action/call-to-action.component.js";
import Hero from "../../components/hero/hero.component.js";
import Layout from "../../components/layout/layout.component.js";
import PortfolioPreview from "../../components/portfolio-preview/portfolio-preview.component.js";
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
        <ServicePreview services={services} />
        <PortfolioPreview portfolio={portfolio} />
        <CallToAction />
      </div>
    </Layout>
  );
};

export default Home;
