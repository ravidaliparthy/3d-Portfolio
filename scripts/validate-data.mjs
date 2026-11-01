import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../src/data/portfolioData.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

// Inline zod validation matching schema.ts
const MoodSchema = z.enum(['dawn', 'day', 'golden', 'dusk', 'night']);
const BiomeSchema = z.enum(['meadows', 'forest', 'canyon', 'coast', 'mountains', 'viaduct', 'snow']);
const StationTypeSchema = z.enum(['education', 'project', 'research', 'achievement', 'leadership', 'certification', 'about']);
const TicketSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  class: z.string().min(1),
  seat: z.string().min(1),
  fare: z.string().default('COMPLIMENTARY PASS'),
}).strict();

const QASchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(5),
}).strict();

const EngineeringChallengeSchema = z.object({
  title: z.string().min(1),
  realityAndContext: z.string().min(10),
  theObstacle: z.string().min(10),
  decisionAndTradeoff: z.string().min(10),
  outcomeMetric: z.string().min(5),
}).strict();

const StationLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['github', 'live', 'paper', 'credential', 'external']).default('external'),
}).strict();

const StationSchema = z.object({
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
  cameraBookmark: z.array(z.number()).min(3).max(6).optional(),
  mood: MoodSchema,
  biome: BiomeSchema,
  ticket: TicketSchema,
  guideLines: z.array(z.string().min(5)).min(1),
  source: z.object({
    verifiedByOwner: z.boolean(),
    documentReference: z.string().min(1),
  }).strict(),
}).strict();

const SkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['languages', 'ml_data', 'full_stack', 'systems_cs', 'tools']),
  level: z.string().default('proficient'),
}).strict();

const GuideProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  appearanceDescription: z.string().min(10),
  avatarImage: z.string().min(1),
  introLines: z.array(z.string().min(5)).min(1),
  outroLines: z.array(z.string().min(5)).min(1),
  idleLines: z.array(z.string().min(5)).min(1),
  verifiedByOwner: z.boolean(),
}).strict();

const IntroSchema = z.object({
  stationName: z.string().min(1),
  platformNumber: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().min(1),
  welcomeTitle: z.string().min(1),
  welcomeSubtitle: z.string().min(1),
  tagline: z.string().min(1),
  callToAction: z.string().min(1),
}).strict();

const OutroSchema = z.object({
  stationName: z.string().min(1),
  farewellTitle: z.string().min(1),
  farewellSubtitle: z.string().min(1),
  closingNotes: z.string().min(10),
  resumeUrl: z.string().min(1),
  contactLinks: z.array(StationLinkSchema),
}).strict();

const HowBuiltSchema = z.object({
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

const StoryKindSchema = z.enum([
  'chance',
  'mistake',
  'care',
  'think',
  'ownership',
]);

const StoryEvidenceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
}).strict();

const StoryEntrySchema = z.object({
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

const PortfolioDataSchema = z.object({
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

console.log('[Validator] Validating portfolioData.json against strict Zod schema...');
const parsed = PortfolioDataSchema.safeParse(data);

if (!parsed.success) {
  console.error('[Validator Error] Schema validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

console.log('[Validator] Schema validation passed successfully!');

// Cross-referencing skills
const declaredSkillIds = new Set(data.skills.map((s) => s.id));
const usedSkillIds = new Set();

for (const station of data.stations) {
  for (const sId of station.skillIds) {
    if (!declaredSkillIds.has(sId)) {
      console.error(`[Validator Error] Station "${station.id}" references undeclared skillId: "${sId}"`);
      process.exit(1);
    }
    usedSkillIds.add(sId);
  }
}

for (const skill of data.skills) {
  if (!usedSkillIds.has(skill.id)) {
    console.error(`[Validator Error] Skill "${skill.id}" declared in skills catalog but never evidenced by any station!`);
    process.exit(1);
  }
}

console.log(`[Validator] Referential integrity passed: all ${data.skills.length} skills are evidenced across ${data.stations.length} stations.`);

// Check for TODOs
const isStrictProd = process.argv.includes('--strict-prod') || process.env.NODE_ENV === 'production';
let todoCount = 0;
let unverifiedCount = 0;

function checkTodos(obj, pathName = '') {
  // If this object is a story entry with status "draft", skip checking it for production gates
  if (obj !== null && typeof obj === 'object' && obj.status === 'draft') {
    return;
  }

  if (obj === 'TODO') {
    todoCount++;
    console.warn(`[Validator TODO] Found at ${pathName}`);
  } else if (typeof obj === 'string' && (obj.includes('[[SLOT') || obj.includes('TODO'))) {
    todoCount++;
    console.warn(`[Validator TODO/SLOT] Found at ${pathName}`);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => checkTodos(item, `${pathName}[${idx}]`));
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.verifiedByOwner === false) {
      unverifiedCount++;
      console.warn(`[Validator Unverified] Found at ${pathName}.verifiedByOwner: false`);
    }
    for (const [k, v] of Object.entries(obj)) {
      checkTodos(v, pathName ? `${pathName}.${k}` : k);
    }
  }
}

checkTodos(data);

console.log(`[Validator Report] Status: TODO items: ${todoCount}, Unverified items: ${unverifiedCount}`);

if (isStrictProd && (todoCount > 0 || unverifiedCount > 0)) {
  console.error('[Validator Gate] Production build failed because unverified items or TODO values remain.');
  process.exit(1);
}

console.log('[Validator] All checks completed successfully.');

