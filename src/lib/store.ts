import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MatchRecord {
  id: string;
  date: number;
  opponent: string;
  result: 'win' | 'loss' | 'tie';
  earnedCELO: number;
  earnedXP: number;
}

export interface UserState {
  xp: number;
  level: number;
  winStreak: number;
  maxWinStreak: number;
  gamesPlayed: number;
  wins: number;
  bestScore: number;
  lastDailyChallenge: string | null;
  badges: string[];
  matchHistory: MatchRecord[];
  addXP: (amount: number) => void;
  recordMatch: (match: Omit<MatchRecord, 'id' | 'date'>, score: number) => void;
  resetStreak: () => void;
  awardBadge: (badgeId: string) => void;
  completeDailyChallenge: () => boolean;
}

const XP_PER_LEVEL = 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      winStreak: 0,
      maxWinStreak: 0,
      gamesPlayed: 0,
      wins: 0,
      bestScore: 0,
      lastDailyChallenge: null,
      badges: [],
      matchHistory: [],

      addXP: (amount) =>
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          return { xp: newXp, level: Math.max(state.level, newLevel) };
        }),

      recordMatch: (matchData, score) =>
        set((state) => {
          const isWin = matchData.result === 'win';
          const newWinStreak = isWin ? state.winStreak + 1 : 0;
          const newGamesPlayed = state.gamesPlayed + 1;
          const newWins = isWin ? state.wins + 1 : state.wins;
          
          const newMatch: MatchRecord = {
            ...matchData,
            id: Math.random().toString(36).substr(2, 9),
            date: Date.now(),
          };

          return {
            winStreak: newWinStreak,
            maxWinStreak: Math.max(state.maxWinStreak, newWinStreak),
            gamesPlayed: newGamesPlayed,
            wins: newWins,
            bestScore: Math.max(state.bestScore, score),
            matchHistory: [newMatch, ...state.matchHistory].slice(0, 50),
            ...((isWin || matchData.earnedXP > 0) && {
              xp: state.xp + matchData.earnedXP,
              level: Math.floor((state.xp + matchData.earnedXP) / XP_PER_LEVEL) + 1,
            }),
          };
        }),

      completeDailyChallenge: () => {
        const today = new Date().toISOString().split('T')[0];
        let allowed = false;
        set((state) => {
          if (state.lastDailyChallenge !== today) {
            allowed = true;
            return { lastDailyChallenge: today };
          }
          return state;
        });
        return allowed;
      },

      resetStreak: () => set({ winStreak: 0 }),
      
      awardBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId) ? state.badges : [...state.badges, badgeId],
        })),
    }),
    {
      name: 'brainstake-user-storage',
    }
  )
);
