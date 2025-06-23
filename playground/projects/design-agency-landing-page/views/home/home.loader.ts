export interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

export interface HomeData {
  hero: HeroData;
  services: Service[];
  portfolio: PortfolioItem[];
}

const homeLoader = async (): Promise<HomeData> => {
  // Simulate API call
  return {
    hero: {
      title: "We Create Digital Experiences That Matter",
      subtitle:
        "Award-winning design agency specializing in branding, web design, and digital strategy. We help businesses tell their story through compelling visual narratives.",
      buttonText: "View Our Work",
      buttonLink: "/portfolio",
    },
    services: [
      {
        id: "1",
        title: "Brand Identity",
        description:
          "Complete brand identity design including logos, color palettes, and brand guidelines.",
        icon: "🎨",
      },
      {
        id: "2",
        title: "Web Design",
        description:
          "Modern, responsive websites that convert visitors into customers.",
        icon: "💻",
      },
      {
        id: "3",
        title: "Digital Strategy",
        description:
          "Data-driven strategies to grow your business online and reach your target audience.",
        icon: "📊",
      },
    ],
    portfolio: [
      {
        id: "1",
        title: "TechStart Branding",
        description: "Complete rebrand for a growing tech startup",
        image: "/images/portfolio/techstart.jpg",
        category: "Branding",
      },
      {
        id: "2",
        title: "E-commerce Platform",
        description: "Custom e-commerce website with advanced features",
        image: "/images/portfolio/ecommerce.jpg",
        category: "Web Design",
      },
      {
        id: "3",
        title: "Restaurant Website",
        description: "Modern website for a local restaurant chain",
        image: "/images/portfolio/restaurant.jpg",
        category: "Web Design",
      },
    ],
  };
};

export default homeLoader;
