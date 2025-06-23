import { useEffect, useState } from "react";

export interface ServiceDetails {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
}

interface UseServicesReturn {
  services: ServiceDetails[];
  isLoading: boolean;
  error: string | null;
}

const useServices = (): UseServicesReturn => {
  const [services, setServices] = useState<ServiceDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Simulate API call with static data
        const data = [
          {
            id: "1",
            title: "Brand Identity Design",
            description:
              "Complete brand identity packages that tell your story and connect with your audience. We create memorable logos, color palettes, typography, and brand guidelines that set you apart from the competition.",
            icon: "🎨",
            features: [
              "Logo design and variations",
              "Color palette development",
              "Typography selection",
              "Brand guidelines document",
              "Business card design",
              "Letterhead and stationery",
            ],
            price: "$2,500",
          },
          {
            id: "2",
            title: "Web Design & Development",
            description:
              "Modern, responsive websites that look great on all devices and convert visitors into customers. We focus on user experience, performance, and search engine optimization.",
            icon: "💻",
            features: [
              "Custom responsive design",
              "Mobile-first approach",
              "SEO optimization",
              "Content management system",
              "Performance optimization",
              "Analytics integration",
            ],
            price: "$5,000",
          },
          {
            id: "3",
            title: "Digital Strategy",
            description:
              "Data-driven strategies to grow your business online. We help you understand your audience, optimize your digital presence, and create marketing campaigns that deliver results.",
            icon: "📊",
            features: [
              "Market research and analysis",
              "Competitor analysis",
              "Content strategy",
              "Social media strategy",
              "SEO strategy",
              "Analytics and reporting",
            ],
            price: "$3,000",
          },
          {
            id: "4",
            title: "E-commerce Solutions",
            description:
              "Complete e-commerce platforms that drive sales and provide excellent user experiences. From product catalogs to payment processing, we handle every aspect of your online store.",
            icon: "🛒",
            features: [
              "Custom store design",
              "Product catalog setup",
              "Payment integration",
              "Inventory management",
              "Order tracking",
              "Mobile optimization",
            ],
            price: "$8,000",
          },
        ];

        setServices(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    services,
    isLoading,
    error,
  };
};

export default useServices;
