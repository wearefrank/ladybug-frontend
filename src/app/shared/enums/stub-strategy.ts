export const reportStubStrategyConst = ['Stub all external connection code', 'Never', 'Always'] as const;
export type ReportStubStrategy = (typeof reportStubStrategyConst)[number];

export const checkpointStubStrategyConst = [
  'Use report level stub strategy',
  'Always stub this checkpoint',
  'Never stub this checkpoint',
] as const;
