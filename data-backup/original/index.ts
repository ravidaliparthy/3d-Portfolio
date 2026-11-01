import rawData from './portfolioData.json';
import { PortfolioDataSchema, type PortfolioData, type Station, type Skill } from './schema';

export const portfolioData: PortfolioData = PortfolioDataSchema.parse(rawData);

export const getStationByIndex = (index: number): Station | undefined => {
  return portfolioData.stations[index];
};

export const getStationById = (id: string): Station | undefined => {
  return portfolioData.stations.find((s) => s.id === id);
};

export const getSkillById = (id: string): Skill | undefined => {
  return portfolioData.skills.find((s) => s.id === id);
};

export * from './schema';

