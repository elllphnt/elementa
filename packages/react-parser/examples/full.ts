import {
  compileComponentModule,
  getStylesheetFromCssModule,
  parseComponentModule,
  parseCssModule,
  standardizeComponent,
} from "../src/index.js";

const tsx = `
import React from 'react';

interface Props {
  slotFills: { [key: string]: React.ReactNode };
}

function LandingPage(props: Props) {
  return (
    <div className="landingPage">
      <header className="landingPage-header">
        <elll-slot slotName="header">
          <h1 className="landingPage-title">Blockchain App</h1>
        </elll-slot>
      </header>

      <main className="landingPage-main">
        <elll-slot slotName="hero">
          <div className="landingPage-hero">
            <h2 className="landingPage-heroTitle">
              Unlock the Future with Our Blockchain App
            </h2>
            <p className="landingPage-heroSubtitle">
              Secure, transparent, and decentralized solutions for your needs.
            </p>
            <button className="landingPage-heroButton">Get Started</button>
          </div>
        </elll-slot>

        <section className="landingPage-features">
          <elll-slot slotName="features">
            <div className="landingPage-feature">
              <h3 className="landingPage-featureTitle">Security</h3>
              <p className="landingPage-featureDescription">
                Ensuring the highest level of security for your data and
                transactions.
              </p>
            </div>
            <div className="landingPage-feature">
              <h3 className="landingPage-featureTitle">Transparency</h3>
              <p className="landingPage-featureDescription">
                Providing complete transparency and auditability.
              </p>
            </div>
            <div className="landingPage-feature">
              <h3 className="landingPage-featureTitle">Decentralization</h3>
              <p className="landingPage-featureDescription">
                Empowering users with a decentralized and trustless platform.
              </p>
            </div>
          </elll-slot>
        </section>

        <section className="landingPage-cta">
          <elll-slot slotName="cta">
            <h2 className="landingPage-ctaTitle">Ready to Transform?</h2>
            <p className="landingPage-ctaDescription">
              Join our community and explore the possibilities of blockchain
              technology.
            </p>
            <button className="landingPage-ctaButton">Learn More</button>
          </elll-slot>
        </section>
      </main>

      <footer className="landingPage-footer">
        <elll-slot slotName="footer">
          <p className="landingPage-copyright">
            © 2024 Blockchain App. All rights reserved.
          </p>
        </elll-slot>
      </footer>
    </div>
  );
}

export default LandingPage;
`;

const css = `
.landingPage {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
}

.landingPage-header {
  background-color: #333;
  color: #fff;
  padding: 1rem 0;
  text-align: center;
}

.landingPage-title {
  margin: 0;
  font-size: 2rem;
}

.landingPage-main {
  padding: 2rem;
}

.landingPage-hero {
  background-color: #fff;
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.landingPage-heroTitle {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.landingPage-heroSubtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.landingPage-heroButton {
  background-color: #007bff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

.landingPage-features {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
}

.landingPage-feature {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 30%;
}

.landingPage-featureTitle {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.landingPage-featureDescription {
  color: #666;
}

.landingPage-cta {
  background-color: #f0f0f0;
  padding: 2rem;
  text-align: center;
  margin-top: 2rem;
  border-radius: 8px;
}

.landingPage-ctaTitle {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.landingPage-ctaDescription {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.landingPage-ctaButton {
  background-color: #28a745;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

.landingPage-footer {
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 1rem 0;
  margin-top: 2rem;
}

.landingPage-copyright {
  margin: 0;
  font-size: 0.9rem;
}
`;

const cssModule = parseCssModule(css);
const module = parseComponentModule({
  code: standardizeComponent(tsx),
  getStylesheet: (classes, conditionals) => {
    return getStylesheetFromCssModule({
      classes,
      conditionals,
      module: cssModule,
      getModifierDefinition: () => undefined,
    });
  },
});
const resources = compileComponentModule({
  module,
  getResourcePath: (_, resource) => resource,
  getAdjustedPath: (_, path) => path,
});
console.log(resources);
