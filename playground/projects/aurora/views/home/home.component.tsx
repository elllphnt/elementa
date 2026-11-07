import React from "react";
import FeatureCard from "../../components/feature-card/feature-card.component.js";
import Nav from "../../components/nav/nav.component.js";
import "./home.component.css";

const Home: React.FC = () => {
  return (
    <div id="root">
      <div id="glow-a"></div>
      <div id="glow-b"></div>
      <div id="glow-c"></div>
      <div id="grid"></div>

      <Nav />

      <section id="hero">
        <a id="badge" href="/changelog">
          <span id="badge-tag">New</span>
          <span id="badge-text">Realtime funnels are here</span>
          <span id="badge-arrow">→</span>
        </a>
        <div id="headline">
          <span id="headline-lead">Product analytics</span>
          <span id="headline-accent">at the speed of thought</span>
        </div>
        <p id="subhead">
          Aurora turns every click, session and experiment into answers your
          whole team can act on. No SQL, no waiting, no dashboards nobody reads.
        </p>
        <div id="ctas">
          <a id="cta-primary" href="/signup">Start for free</a>
          <a id="cta-secondary" href="/demo">Watch the demo</a>
        </div>
        <p id="fineprint">Free up to 1M events · No credit card required</p>
      </section>

      <section id="showcase">
        <div id="window">
          <div id="window-bar">
            <span id="dot-red"></span>
            <span id="dot-amber"></span>
            <span id="dot-green"></span>
            <span id="window-url">app.aurora.dev / growth / overview</span>
          </div>
          <div id="window-body">
            <aside id="sidebar">
              <span id="side-item-active">Overview</span>
              <span id="side-item-2">Funnels</span>
              <span id="side-item-3">Retention</span>
              <span id="side-item-4">Experiments</span>
              <span id="side-item-5">Sessions</span>
            </aside>
            <div id="panel">
              <div id="kpis">
                <div id="kpi-1">
                  <span id="kpi-1-label">Active users</span>
                  <span id="kpi-1-value">48,219</span>
                  <span id="kpi-1-delta">▲ 12.4%</span>
                </div>
                <div id="kpi-2">
                  <span id="kpi-2-label">Conversion</span>
                  <span id="kpi-2-value">6.82%</span>
                  <span id="kpi-2-delta">▲ 0.9 pts</span>
                </div>
                <div id="kpi-3">
                  <span id="kpi-3-label">Avg. session</span>
                  <span id="kpi-3-value">4m 12s</span>
                  <span id="kpi-3-delta-down">▼ 3.1%</span>
                </div>
              </div>
              <div id="chart-card">
                <div id="chart-head">
                  <span id="chart-title">Weekly active users</span>
                  <span id="chart-range">Last 12 weeks</span>
                </div>
                <div id="chart">
                  <span id="bar-1"></span>
                  <span id="bar-2"></span>
                  <span id="bar-3"></span>
                  <span id="bar-4"></span>
                  <span id="bar-5"></span>
                  <span id="bar-6"></span>
                  <span id="bar-7"></span>
                  <span id="bar-8"></span>
                  <span id="bar-9"></span>
                  <span id="bar-10"></span>
                  <span id="bar-11"></span>
                  <span id="bar-12"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="float-card">
          <span id="float-pulse"></span>
          <div id="float-text">
            <span id="float-title">Experiment shipped</span>
            <span id="float-sub">Checkout v2 · +18% conversion</span>
          </div>
        </div>
      </section>

      <section id="logos">
        <span id="logos-label">Trusted by product teams at</span>
        <div id="logos-row">
          <span id="logo-1">Quillon</span>
          <span id="logo-2">Vantor</span>
          <span id="logo-3">Hexaline</span>
          <span id="logo-4">Orbitly</span>
          <span id="logo-5">Nimbra</span>
        </div>
      </section>

      <section id="features">
        <div id="features-head">
          <span id="features-eyebrow">Why Aurora</span>
          <h2 id="features-title">Everything you need to understand your users</h2>
        </div>
        <div id="bento">
          <div id="bento-wide">
            <FeatureCard
              eyebrow="Funnels"
              title="See exactly where users drop off"
              description="Build multi-step funnels in seconds and break them down by any property, cohort or experiment."
              accent="violet"
            >
              <div id="funnel">
                <span id="funnel-1"></span>
                <span id="funnel-2"></span>
                <span id="funnel-3"></span>
                <span id="funnel-4"></span>
              </div>
            </FeatureCard>
          </div>
          <div id="bento-tall">
            <FeatureCard
              eyebrow="Realtime"
              title="Live, not yesterday"
              description="Events land in under a second, so launches and incidents show up while they happen."
              accent="cyan"
            >
              <div id="pulse">
                <span id="pulse-ring"></span>
                <span id="pulse-core"></span>
              </div>
            </FeatureCard>
          </div>
          <div id="bento-a">
            <FeatureCard
              eyebrow="Retention"
              title="Know who comes back"
              description="Cohort curves that update as your product changes."
              accent="lime"
            >
              <div id="retention">
                <span id="ret-1"></span>
                <span id="ret-2"></span>
                <span id="ret-3"></span>
                <span id="ret-4"></span>
                <span id="ret-5"></span>
                <span id="ret-6"></span>
              </div>
            </FeatureCard>
          </div>
          <div id="bento-b">
            <FeatureCard
              eyebrow="Experiments"
              title="Ship with confidence"
              description="Feature flags and A/B tests with stats you can trust."
              accent="violet"
            >
              <div id="toggle">
                <span id="toggle-knob"></span>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      <section id="closing">
        <h2 id="closing-title">Your next insight is one query away.</h2>
        <a id="closing-cta" href="/signup">Get started, it's free</a>
      </section>

      <footer id="footer">
        <span id="footer-brand">© 2026 Aurora Labs</span>
        <span id="footer-note">A sample project for the Elementa engine</span>
      </footer>
    </div>
  );
};

export default Home;
