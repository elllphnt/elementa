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
