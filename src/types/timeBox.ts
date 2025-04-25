export interface TimeBox {
  id: string;
  name: string;
  description: string;
  warnThreshold?: number;
  expireThreshold?: number;
  order: number;
}

export type TimeBoxStage = 'queue' | 'do' | 'doing' | 'today' | 'done';