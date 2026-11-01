import rawData from './portfolioData.json';
import {
  PortfolioDataSchema,
  type PortfolioData,
  type Station,
  type Skill,
  type StoryEntry,
} from './schema';

const isProd = process.env.NODE_ENV === 'production' || (import.meta as { env?: { PROD?: boolean } }).env?.PROD;
const isBrowser = typeof window !== 'undefined';
const allowDrafts = !isProd || (isBrowser && window.location.search.includes('drafts=1'));

const processedData: PortfolioData = {
  ...rawData,
  story: rawData.story
    ? rawData.story.filter((s: { status: string }) => allowDrafts || s.status === 'verified')
    : undefined,
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

