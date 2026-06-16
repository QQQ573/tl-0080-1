import type { BrandState, BrandConfig } from './types';

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
    let current = baseIndex;
    for (let i = 0; i < 60; i++) {
      current += (Math.random() - 0.5) * 40;
      current = Math.max(100, Math.min(1500, current));
      history.push(current);
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

  return sorted;
}

function computeRanks(states: BrandState[]): BrandState[] {
  const prevRanks = new Map<string, number>();
  states.forEach((s) => prevRanks.set(s.brand, s.rank));

  const sorted = [...states].sort((a, b) => b.index - a.index);
  sorted.forEach((s, i) => {
    s.prevRank = prevRanks.get(s.brand) ?? s.rank;
    s.rank = i + 1;
  });
  return sorted;
}

class BrandStore {
  states = $state<BrandState[]>(createInitialState());
  tickCount = $state(0);

  private interval: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private tick() {
    const updated = this.states.map((s) => {
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
    this.states = computeRanks(updated);
    this.tickCount++;
  }
}

export const brandStore = new BrandStore();
