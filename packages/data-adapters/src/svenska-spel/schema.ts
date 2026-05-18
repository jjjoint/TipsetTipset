import { z } from 'zod';

const SvenskaFolketSchema = z.object({
  one: z.string(),
  x: z.string(),
  two: z.string(),
  date: z.string().optional(),
}).nullable();

const OddsValueSchema = z.object({
  one: z.string(),
  x: z.string(),
  two: z.string(),
}).nullable();

const BetMetricsValueSchema = z.object({
  outcome: z.string(),
  odds: z.object({
    odds: z.string(),
    favouriteOdds: z.string().optional(),
    startOdds: z.string().optional(),
  }),
  distribution: z.object({
    distribution: z.string(),
    refDistribution: z.string().optional(),
  }),
});

const BetMetricsSchema = z.object({
  eventTypeId: z.number(),
  eventType: z.string(),
  distributionDate: z.string(),
  values: z.array(BetMetricsValueSchema),
}).nullable();

const ParticipantSchema = z.object({
  id: z.number(),
  type: z.enum(['home', 'away']),
  name: z.string(),
  mediumName: z.string().optional(),
  shortName: z.string().optional(),
  countryName: z.string().optional(),
  isoCode: z.string().optional(),
});

const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.object({
    id: z.number(),
    name: z.string(),
    isoCode: z.string(),
  }).optional(),
});

const MatchSchema = z.object({
  matchId: z.number(),
  matchStart: z.string(),
  status: z.string(),
  statusId: z.number(),
  sportEventStatus: z.string(),
  participants: z.array(ParticipantSchema),
  league: LeagueSchema.optional(),
  result: z.array(z.unknown()),
});

const DrawEventSchema = z.object({
  cancelled: z.boolean(),
  eventNumber: z.number(),
  eventDescription: z.string(),
  eventComment: z.string().optional(),
  participantType: z.string(),
  match: MatchSchema,
  odds: OddsValueSchema,
  startOdds: OddsValueSchema.optional(),
  betMetrics: BetMetricsSchema,
  svenskaFolket: SvenskaFolketSchema,
});

export const DrawSchema = z.object({
  productName: z.string(),
  drawNumber: z.number(),
  drawState: z.string(),
  drawStateId: z.number(),
  regCloseTime: z.string(),
  regOpenTime: z.string(),
  drawComment: z.string().optional(),
  currentNetSale: z.string().optional(),
  fund: z.unknown().nullable().optional(),
  drawEvents: z.array(DrawEventSchema),
});

export const DrawsResponseSchema = z.object({
  draws: z.array(DrawSchema),
  error: z.unknown().nullable(),
});

export type SvsDraw = z.infer<typeof DrawSchema>;
export type SvsDrawEvent = z.infer<typeof DrawEventSchema>;
