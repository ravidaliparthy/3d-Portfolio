import { z } from 'zod';

export const MoodSchema = z.enum(['dawn', 'day', 'golden', 'dusk', 'night']);
export type Mood = z.infer<typeof MoodSchema>;

export const BiomeSchema = z.enum([
  'meadows',
  'forest',
  'canyon',
  'coast',
  'mountains',
  'viaduct',
  'snow',
]);
export type Biome = z.infer<typeof BiomeSchema>;

export const StationTypeSchema = z.enum([
  'about',
  'education',
  'project',
  'research',
  'achievement',
  'leadership',
  'certification',
]);
export type StationType = z.infer<typeof StationTypeSchema>;

export const GuideStateSchema = z.enum([
  'greeting',
  'pointing',
  'thinking',
  'celebrating',
  'idle',
]);
export type GuideState = z.infer<typeof GuideStateSchema>;

export const TicketSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  class: z.string().min(1),
  seat: z.string().min(1),
  fare: z.string().default('COMPLIMENTARY PASS'),
}).strict();

export const QASchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(5),
}).strict();

export const EngineeringChallengeSchema = z.object({
  title: z.string().min(1),
  realityAndContext: z.string().min(10),
  theObstacle: z.string().min(10),
  decisionAndTradeoff: z.string().min(10),
  outcomeMetric: z.string().min(5),
}).strict();
export type EngineeringChallenge = z.infer<typeof EngineeringChallengeSchema>;

export const StationLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['github', 'live', 'paper', 'credential', 'external']).default('external'),
}).strict();

export const CameraBookmarkSchema = z.array(z.number()).min(3).max(6);
export type CameraBookmark = z.infer<typeof CameraBookmarkSchema>;

export const StationSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  organization: z.string().min(1),
  location: z.string().min(1),
  period: z.string().min(1),
  type: StationTypeSchema,
  summary: z.string().min(10).max(300),
  highlights: z.array(z.string().min(5)).min(1),
  metrics: z.array(z.string().min(1)),
  skillIds: z.array(z.string().min(1)),
  links: z.array(StationLinkSchema),
  qa: z.array(QASchema).min(1),
  challenges: z.array(EngineeringChallengeSchema).optional(),
  cameraBookmark: CameraBookmarkSchema.optional(),
  mood: MoodSchema,
  biome: BiomeSchema,
  ticket: TicketSchema,
  guideLines: z.array(z.string().min(5)).min(1),
  source: z.object({
    verifiedByOwner: z.boolean(),
    documentReference: z.string().min(1),
  }).strict(),
}).strict();

export const SkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['languages', 'ml_data', 'full_stack', 'systems_cs', 'tools']),
  level: z.string().default('proficient'),
}).strict();

export const GuideProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  appearanceDescription: z.string().min(10),
  avatarImage: z.string().min(1),
  introLines: z.array(z.string().min(5)).min(1),
  outroLines: z.array(z.string().min(5)).min(1),
  idleLines: z.array(z.string().min(5)).min(1),
  verifiedByOwner: z.boolean(),
}).strict();

export const IntroSchema = z.object({
  stationName: z.string().min(1),
  platformNumber: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().min(1),
  welcomeTitle: z.string().min(1),
  welcomeSubtitle: z.string().min(1),
  tagline: z.string().min(1),
  callToAction: z.string().min(1),
}).strict();

export const OutroSchema = z.object({
  stationName: z.string().min(1),
  farewellTitle: z.string().min(1),
  farewellSubtitle: z.string().min(1),
  closingNotes: z.string().min(10),
  resumeUrl: z.string().min(1),
  contactLinks: z.array(StationLinkSchema),
}).strict();

export const HowBuiltSchema = z.object({
  stackSummary: z.string().min(1),
  architectureNotes: z.string().min(1),
  measuredMetrics: z.object({
    drawCallsLow: z.number().or(z.literal('TODO')),
    drawCallsHigh: z.number().or(z.literal('TODO')),
    triangleCount: z.number().or(z.literal('TODO')),
    bundleGzipKB: z.number().or(z.literal('TODO')),
    lighthouseMobilePerformance: z.number().or(z.literal('TODO')),
    lighthouseDesktopPerformance: z.number().or(z.literal('TODO')),
  }).strict(),
}).strict();

export const StoryKindSchema = z.enum([
  'chance',
  'mistake',
  'care',
  'think',
  'ownership',
]);
export type StoryKind = z.infer<typeof StoryKindSchema>;

export const StoryEvidenceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
}).strict();

export const StoryEntrySchema = z.object({
  id: z.string().min(1),
  kind: StoryKindSchema,
  headline: z.string().min(1),
  summary: z.string().max(280),
  body: z.string().min(1),
  takeaway: z.string().min(1),
  aiNote: z.string().optional(),
  linkedStationHint: z.string().nullable().optional(),
  linkedStationId: z.string().nullable().optional(),
  evidence: z.array(StoryEvidenceSchema),
  status: z.enum(['draft', 'verified']).default('draft'),
  verifiedByOwner: z.boolean().default(false),
}).strict();
export type StoryEntry = z.infer<typeof StoryEntrySchema>;

export const PortfolioDataSchema = z.object({
  owner: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    location: z.string().min(1),
    linkedin: z.string().url(),
    github: z.string().url(),
    portfolioUrl: z.string().url(),
    bioSummary: z.string().min(10),
  }).strict(),
  guide: GuideProfileSchema,
  intro: IntroSchema,
  outro: OutroSchema,
  howBuilt: HowBuiltSchema,
  skills: z.array(SkillSchema).min(1),
  stations: z.array(StationSchema).min(1),
  story: z.array(StoryEntrySchema).optional(),
}).strict();

export type PortfolioData = z.infer<typeof PortfolioDataSchema>;
export type Station = z.infer<typeof StationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type StationLink = z.infer<typeof StationLinkSchema>;
export type QAItem = z.infer<typeof QASchema>;

