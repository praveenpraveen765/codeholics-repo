export enum AgentStatus {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  SYNTHESIZING = 'SYNTHESIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface Slide {
  title: string;
  points: string[];
  summary: string;
  metric?: string; // A key stat if available
}

export interface Source {
  title: string;
  uri: string;
}

export interface PresentationData {
  topic: string;
  slides: Slide[];
  sources: Source[];
}

export interface ResearchResult {
  rawText: string;
  sources: Source[];
}
