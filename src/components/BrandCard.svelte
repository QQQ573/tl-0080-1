<script lang="ts">
  import Sparkline from './Sparkline.svelte';
  import AnimatedNumber from './AnimatedNumber.svelte';
  import RankArrow from './RankArrow.svelte';
  import type { BrandState } from '../types';

  interface Props {
    state: BrandState;
    compact?: boolean;
  }

  let { state, compact = false }: Props = $props();

  let rankChangeClass = $derived(
    state.rank < state.prevRank
      ? 'rank-up'
      : state.rank > state.prevRank
        ? 'rank-down'
        : ''
  );
</script>

<div class="brand-card" class:compact={compact} class:rank-up={rankChangeClass === 'rank-up'} class:rank-down={rankChangeClass === 'rank-down'}>
  <div class="card-left">
    <div class="rank-badge" style="background: {state.color}20; color: {state.color}; border: 1px solid {state.color}40;">
      {state.rank}
    </div>
  </div>

  <div class="card-center">
    <div class="card-header">
      <div class="brand-dot" style="background: {state.color}; box-shadow: 0 0 8px {state.color}80;"></div>
      <span class="brand-name">{state.brand}</span>
      {#if !compact}
        <span class="category-tag" style="color: {state.color}; border-color: {state.color}40;">{state.category}</span>
      {/if}
      <RankArrow rank={state.rank} prevRank={state.prevRank} />
    </div>
    <div class="index-row">
      <AnimatedNumber value={state.index} color={state.color} />
      <span class="index-label">热度指数</span>
    </div>
  </div>

  <div class="card-right">
    <Sparkline history={state.history} color={state.color} width={compact ? 160 : 240} height={compact ? 40 : 56} />
  </div>
</div>

<style>
  .brand-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #0d1321 0%, #111927 100%);
    border: 1px solid #1e293b;
    border-radius: 12px;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .brand-card.compact {
    padding: 10px 16px;
    gap: 12px;
    border-radius: 10px;
  }

  .brand-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: var(--card-accent, #1e293b);
  }

  .brand-card.rank-up {
    border-color: #00f5d430;
    box-shadow: 0 0 20px #00f5d410, inset 0 0 30px #00f5d408;
  }

  .brand-card.rank-up::before {
    background: #00f5d4;
    box-shadow: 0 0 12px #00f5d480;
  }

  .brand-card.rank-down {
    border-color: #f7258530;
    box-shadow: 0 0 20px #f7258510, inset 0 0 30px #f7258508;
  }

  .brand-card.rank-down::before {
    background: #f72585;
    box-shadow: 0 0 12px #f7258580;
  }

  .card-left {
    flex-shrink: 0;
  }

  .rank-badge {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .compact .rank-badge {
    width: 30px;
    height: 30px;
    font-size: 0.95rem;
  }

  .card-center {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .compact .card-header {
    margin-bottom: 4px;
    gap: 8px;
  }

  .brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .compact .brand-dot {
    width: 8px;
    height: 8px;
  }

  .brand-name {
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    color: #e2e8f0;
    letter-spacing: 0.02em;
  }

  .compact .brand-name {
    font-size: 0.9rem;
  }

  .category-tag {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.7rem;
    padding: 2px 8px;
    border: 1px solid;
    border-radius: 4px;
    opacity: 0.8;
  }

  .index-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .compact .index-row {
    gap: 8px;
  }

  .index-label {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.7rem;
    color: #64748b;
    letter-spacing: 0.05em;
  }

  .compact .index-label {
    font-size: 0.65rem;
  }

  .card-right {
    flex-shrink: 0;
  }
</style>
