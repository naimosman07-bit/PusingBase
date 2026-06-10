/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  // Batter Stats
  atBats: number;
  runs: number;
  hits: number;
  rbis: number;
  strikeouts: number;
  walks: number;
  // Pitcher Stats
  pitchesThrown: number;
  strikesThrown: number;
  ballsThrown: number;
  ballsEarned?: number;
  strikesEarned?: number;
  strikeoutsThrown: number;
  walksThrown: number;
  runsAllowed: number;
}

export interface Team {
  name: string;
  roster: Player[];
  battingOrder: string[]; // List of player IDs
}

export interface InningScore {
  inning: number;
  awayRuns: number | null;
  homeRuns: number | null;
}

export interface GameEvent {
  id: string;
  timestamp: string;
  inning: number;
  isTop: boolean;
  messageEn: string;
  messageMs: string;
  score: string; // e.g. "Away 2 - 1 Home"
}

export interface GameState {
  id: string;
  date: string;
  title: string;
  status: 'setup' | 'live' | 'finished';
  awayTeam: Team;
  homeTeam: Team;
  currentInning: number;
  isTopInning: boolean; // true = Top (Away batting), false = Bottom (Home batting)
  outs: number;
  balls: number;
  strikes: number;
  runners: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  inningScores: InningScore[];
  awayRunsTotal: number;
  homeRunsTotal: number;
  awayHitsTotal: number;
  homeHitsTotal: number;
  awayErrorsTotal: number;
  homeErrorsTotal: number;
  currentBatterIndex: {
    away: number;
    home: number;
  };
  currentPitcherId: {
    away: string;
    home: string;
  };
  logs: GameEvent[];
  startTime?: string | null;
  elapsedSeconds?: number;
  gameMode: 'fastpitch' | 'slowpitch';
}

export type Language = 'en' | 'ms';
