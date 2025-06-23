import { useEffect, useState } from "react";

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

interface UseHomeDataReturn {
  hero: HeroData | null;
  services: Service[];
  portfolio: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
}

const useHomeData = (): UseHomeDataReturn => {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Simulate API call with static data
        const data = {
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

        setHero(data.hero);
        setServices(data.services);
        setPortfolio(data.portfolio);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    hero,
    services,
    portfolio,
    isLoading,
    error,
  };
};

export default useHomeData;
