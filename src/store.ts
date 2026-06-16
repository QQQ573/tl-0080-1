import { writable, get } from 'svelte/store';
import type { BrandState, BrandConfig, BrandTick } from './types';

const BRAND_CONFIGS: BrandConfig[] = [
  { brand: '星巴克', category: '咖啡', color: '#00704A' },
  { brand: '瑞幸', category: '咖啡', color: '#003399' },
  { brand: 'Manner', category: '咖啡', color: '#C8102E' },
  { brand: '喜茶', category: '新茶饮', color: '#E8986C' },
  { brand: '奈雪', category: '新茶饮', color: '#6AAF6A' },
  { brand: '蜜雪', category: '新茶饮', color: '#FFD700' },
];

function createInitialState(): BrandState[] {
  const states = BRAND_CONFIGS.map((config) => {
    const baseIndex = 500 + Math.random() * 500;
    const history: number[] = [];
    for (let i = 0; i < 30; i++) {
      history.push(baseIndex + (Math.random() - 0.5) * 60);
    }
    return {
      brand: config.brand,
      category: config.category,
      color: config.color,
      index: Math.round(history[history.length - 1]),
      rank: 0,
      prevRank: 0,
      history,
      lastUpdate: Date.now(),
    };
  });

  const sorted = [...states].sort((a, b) => b.index - a.index);
  sorted.forEach((s, i) => {
    s.rank = i + 1;
    s.prevRank = i + 1;
  });

  return states;
}

function computeRanks(states: BrandState[]): BrandState[] {
  const sorted = [...states].sort((a, b) => b.index - a.index);
  sorted.forEach((s, i) => {
    s.prevRank = s.rank;
    s.rank = i + 1;
  });
  return sorted;
}

export const brandStates = writable<BrandState[]>(createInitialState());

let tickInterval: ReturnType<typeof setInterval> | null = null;

export function startMockEngine() {
  if (tickInterval) return;

  tickInterval = setInterval(() => {
    brandStates.update((states) => {
      const updated = states.map((s) => {
        const delta = (Math.random() - 0.45) * 60;
        const newIndex = Math.max(100, Math.min(1500, s.index + delta));
        const newHistory = [...s.history, newIndex];
        if (newHistory.length > 60) newHistory.shift();
        return {
          ...s,
          index: Math.round(newIndex),
          history: newHistory,
          lastUpdate: Date.now(),
        };
      });
      return computeRanks(updated);
    });
  }, 3000);
}

export function stopMockEngine() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

export const latestTick = writable<BrandTick | null>(null);
export const tickCount = writable<number>(0);
