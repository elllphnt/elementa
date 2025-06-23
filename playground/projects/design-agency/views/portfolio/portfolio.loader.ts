export interface PortfolioItemDetailed {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  client: string;
  year: string;
  url?: string;
}

const portfolioLoader = async (): Promise<PortfolioItemDetailed[]> => {
  // Simulate API call
  return [
    {
      id: "1",
      title: "TechStart Branding",
      description:
        "Complete rebrand for a growing tech startup, including logo design, brand guidelines, and website redesign.",
      image: "/images/portfolio/techstart.jpg",
      category: "Branding",
      tags: ["Logo Design", "Brand Identity", "Website"],
      client: "TechStart Inc.",
      year: "2024",
    },
    {
      id: "2",
      title: "E-commerce Platform",
      description:
        "Custom e-commerce website with advanced features including product customization and subscription services.",
      image: "/images/portfolio/ecommerce.jpg",
      category: "Web Design",
      tags: ["E-commerce", "UI/UX", "Development"],
      client: "StyleShop",
      year: "2024",
    },
    {
      id: "3",
      title: "Restaurant Website",
      description:
        "Modern website for a local restaurant chain with online ordering and reservation system.",
      image: "/images/portfolio/restaurant.jpg",
      category: "Web Design",
      tags: ["Website", "Online Ordering", "Responsive"],
      client: "Bella Vista",
      year: "2023",
    },
    {
      id: "4",
      title: "HealthCare App",
      description:
        "Mobile application design for a healthcare platform connecting patients with doctors.",
      image: "/images/portfolio/healthcare.jpg",
      category: "Mobile App",
      tags: ["Mobile", "Healthcare", "UI/UX"],
      client: "MedConnect",
      year: "2024",
    },
    {
      id: "5",
      title: "Financial Dashboard",
      description:
        "Complex data visualization dashboard for a fintech company with real-time analytics.",
      image: "/images/portfolio/fintech.jpg",
      category: "Web Design",
      tags: ["Dashboard", "Data Viz", "Fintech"],
      client: "FinanceFlow",
      year: "2023",
    },
    {
      id: "6",
      title: "Luxury Brand Identity",
      description:
        "Sophisticated brand identity for a luxury fashion brand including packaging and retail experience.",
      image: "/images/portfolio/luxury.jpg",
      category: "Branding",
      tags: ["Luxury", "Fashion", "Packaging"],
      client: "Luxe Couture",
      year: "2024",
    },
  ];
};

export default portfolioLoader;
