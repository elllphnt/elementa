import React from "react";
import Layout from "../../components/layout/layout.component.js";
import "./about.component.css";

const About: React.FC = () => {
  return (
    <Layout>
      <div id="root">
        <section id="hero">
          <div id="hero-container">
            <h1 id="hero-title">About DesignCo</h1>
            <p id="hero-subtitle">
              We're a passionate team of designers and strategists dedicated to
              creating exceptional digital experiences that help businesses grow
              and connect with their audiences.
            </p>
          </div>
        </section>

        <section id="story">
          <div id="story-container">
            <div id="story-content">
              <h2 id="story-title">Our Story</h2>
              <p id="story-text">
                Founded in 2018, DesignCo started as a small team with a big
                vision: to bridge the gap between beautiful design and
                meaningful business results. We believe that great design isn't
                just about aesthetics—it's about solving problems, telling
                stories, and creating connections.
              </p>
              <p id="story-text">
                Over the years, we've had the privilege of working with
                startups, established businesses, and everything in between.
                Each project teaches us something new and pushes us to innovate
                and improve our craft.
              </p>
            </div>
            <div id="story-visual">
              <div id="story-graphic"></div>
            </div>
          </div>
        </section>

        <section id="values">
          <div id="values-container">
            <h2 id="values-title">Our Values</h2>
            <div id="values-grid">
              <div id="value-card">
                <div id="value-icon">🎯</div>
                <h3 id="value-title">Purpose-Driven</h3>
                <p id="value-description">
                  Every design decision we make is guided by your business goals
                  and user needs.
                </p>
              </div>
              <div id="value-card">
                <div id="value-icon">🤝</div>
                <h3 id="value-title">Collaborative</h3>
                <p id="value-description">
                  We work closely with our clients as partners, not just service
                  providers.
                </p>
              </div>
              <div id="value-card">
                <div id="value-icon">🚀</div>
                <h3 id="value-title">Innovation</h3>
                <p id="value-description">
                  We stay ahead of trends and technologies to deliver
                  cutting-edge solutions.
                </p>
              </div>
              <div id="value-card">
                <div id="value-icon">✨</div>
                <h3 id="value-title">Quality</h3>
                <p id="value-description">
                  We take pride in delivering exceptional work that exceeds
                  expectations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="team">
          <div id="team-container">
            <h2 id="team-title">Meet the Team</h2>
            <div id="team-grid">
              <div id="team-member">
                <div id="member-photo"></div>
                <h3 id="member-name">Sarah Johnson</h3>
                <p id="member-role">Creative Director</p>
                <p id="member-bio">
                  With 10+ years in design, Sarah leads our creative vision and
                  ensures every project meets our high standards.
                </p>
              </div>
              <div id="team-member">
                <div id="member-photo"></div>
                <h3 id="member-name">Mike Chen</h3>
                <p id="member-role">Lead Developer</p>
                <p id="member-bio">
                  Mike brings designs to life with clean, efficient code and
                  cutting-edge web technologies.
                </p>
              </div>
              <div id="team-member">
                <div id="member-photo"></div>
                <h3 id="member-name">Emma Rodriguez</h3>
                <p id="member-role">Strategy Director</p>
                <p id="member-bio">
                  Emma helps clients define their brand strategy and digital
                  roadmap for long-term success.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
