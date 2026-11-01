import rawData from './portfolioData.json';
import {
  PortfolioDataSchema,
  type PortfolioData,
  type Station,
  type Skill,
  type StoryEntry,
} from './schema';

const isBrowser = typeof window !== 'undefined';
// When story=off is passed, disable stories for benchmarking; otherwise all verified & engineering stories are accessible
const isStoryDisabled = isBrowser && window.location.search.includes('story=off');

const processedData: PortfolioData = {
  ...rawData,
  story: isStoryDisabled ? [] : (rawData.story || []),
} as PortfolioData;

export const portfolioData: PortfolioData = PortfolioDataSchema.parse(processedData);

export const getStationByIndex = (index: number): Station | undefined => {
  return portfolioData.stations[index];
};

export const getStationById = (id: string): Station | undefined => {
  return portfolioData.stations.find((s) => s.id === id);
};

export const getSkillById = (id: string): Skill | undefined => {
  return portfolioData.skills.find((s) => s.id === id);
};

export const getStories = (): StoryEntry[] => {
  return portfolioData.story || [];
};

export * from './schema';

