import React from "react";
import "./hero.component.css";

export interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface HeroProps {
  data: HeroData | null;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  if (!data) {
    return <div id="root"></div>;
  }

  return (
    <section id="root">
      <div id="container">
        <div id="content">
          <h1 id="title">{data.title}</h1>
          <p id="subtitle">{data.subtitle}</p>
          <a id="cta-button" href={data.buttonLink}>
            {data.buttonText}
          </a>
        </div>
        <div id="visual">
          <div id="hero-graphic"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
