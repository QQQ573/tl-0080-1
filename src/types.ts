export interface BrandTick {
  brand: string;
  category: string;
  index: number;
  rank: number;
  prevRank: number;
  timestamp: number;
}

export interface BrandState {
  brand: string;
  category: string;
  color: string;
  index: number;
  rank: number;
  prevRank: number;
  history: number[];
  lastUpdate: number;
}

export interface BrandConfig {
  brand: string;
  category: string;
  color: string;
}
