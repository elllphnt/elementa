import React from "react";
import "./feature-card.component.css";

export interface FeatureCardProps {
  eyebrow: string;
  title: string;
  description: string;
  accent: "violet" | "cyan" | "lime";
  children?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  eyebrow,
  title,
  description,
  accent,
  children,
}) => {
  return (
    <article
      id="root"
      className={{
        "accent-violet": accent === "violet",
        "accent-cyan": accent === "cyan",
        "accent-lime": accent === "lime",
      }}
    >
      <div id="visual">{children}</div>
      <div id="body">
        <span id="eyebrow">{eyebrow}</span>
        <h3 id="title">{title}</h3>
        <p id="description">{description}</p>
      </div>
    </article>
  );
};

export default FeatureCard;
