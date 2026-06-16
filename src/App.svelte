<script lang="ts">
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { brandStore } from './store.svelte';
  import BrandCard from './components/BrandCard.svelte';

  let currentTime = $state('');
  let isConnected = $state(true);
  let lastTickTime = $state('-');

  function updateClock() {
    const now = new Date();
    currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
  }

  $effect(() => {
    const interval = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(interval);
  });

  let coffeeBrands = $derived(
    [...brandStore.states]
      .filter(b => b.category === '咖啡')
      .sort((a, b) => a.rank - b.rank)
  );

  let teaBrands = $derived(
    [...brandStore.states]
      .filter(b => b.category === '新茶饮')
      .sort((a, b) => a.rank - b.rank)
  );

  let overallBrands = $derived(
    [...brandStore.states].sort((a, b) => a.rank - b.rank)
  );

  $effect(() => {
    const states = brandStore.states;
    if (states.length > 0) {
      const latest = states.reduce((a, b) => (a.lastUpdate > b.lastUpdate ? a : b));
      lastTickTime = new Date(latest.lastUpdate).toLocaleTimeString('zh-CN', { hour12: false, fractionalSecondDigits: 1 });
    }
  });

  onMount(() => {
    brandStore.start();
    return () => brandStore.stop();
  });
</script>

<div class="dashboard">
  <header class="topbar">
    <div class="topbar-left">
      <div class="logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f5d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <h1 class="topbar-title">冲榜监控</h1>
      <span class="topbar-subtitle">HEYTEA × 联名款 实时热度追踪</span>
    </div>
    <div class="topbar-right">
      <div class="status-indicator" class:connected={isConnected}>
        <span class="status-dot"></span>
        <span class="status-text">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
      </div>
      <div class="clock">{currentTime}</div>
    </div>
  </header>

  <main class="main-content">
    <div class="top-rank-section">
      <div class="section-header">
        <div class="section-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span class="section-title">实时总榜</span>
        <span class="section-count">{overallBrands.length} 品牌</span>
      </div>
      <div class="brand-list overall-list">
        {#each overallBrands as brand (brand.brand)}
          <div animate:flip={{ duration: 600 }}>
            <BrandCard state={brand} />
          </div>
        {/each}
      </div>
    </div>

    <div class="category-sections">
      <div class="category-section">
        <div class="section-header category-header">
          <div class="category-icon coffee-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" y1="2" x2="6" y2="4"/>
              <line x1="10" y1="2" x2="10" y2="4"/>
              <line x1="14" y1="2" x2="14" y2="4"/>
            </svg>
          </div>
          <span class="section-title">咖啡类目</span>
          <span class="section-count">{coffeeBrands.length} 品牌</span>
        </div>
        <div class="brand-list">
          {#each coffeeBrands as brand (brand.brand)}
            <div animate:flip={{ duration: 600 }}>
              <BrandCard state={brand} compact={true} />
            </div>
          {/each}
        </div>
      </div>

      <div class="category-section">
        <div class="section-header category-header">
          <div class="category-icon tea-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 2.1c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5"/>
              <path d="M9.9 2.1c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5"/>
              <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/>
              <path d="M12 12v9"/>
              <path d="M7.5 12a4.5 4.5 0 0 1 9 0"/>
            </svg>
          </div>
          <span class="section-title">新茶饮类目</span>
          <span class="section-count">{teaBrands.length} 品牌</span>
        </div>
        <div class="brand-list">
          {#each teaBrands as brand (brand.brand)}
            <div animate:flip={{ duration: 600 }}>
              <BrandCard state={brand} compact={true} />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </main>

  <footer class="bottombar">
    <div class="bottombar-left">
      <span class="tick-label">最近 Tick</span>
      <span class="tick-time">{lastTickTime}</span>
    </div>
    <div class="bottombar-right">
      <span class="sample-info">采样间隔 3s · 滑动窗口 60pt</span>
    </div>
  </footer>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    background: #0a0e1a;
    color: #e2e8f0;
    font-family: 'Noto Sans SC', sans-serif;
    overflow-x: hidden;
  }

  :global(#app) {
    min-height: 100vh;
  }

  .dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, #0c1a3a 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, #1a0c2e 0%, transparent 50%),
      #0a0e1a;
    padding: 0;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    background: rgba(13, 19, 33, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #1e293b;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #00f5d410;
    border: 1px solid #00f5d430;
    border-radius: 8px;
  }

  .topbar-title {
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #f1f5f9;
    letter-spacing: 0.08em;
  }

  .topbar-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    letter-spacing: 0.05em;
    padding-left: 14px;
    border-left: 1px solid #1e293b;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 20px;
    background: #f7258515;
    border: 1px solid #f7258530;
  }

  .status-indicator.connected {
    background: #00f5d410;
    border-color: #00f5d430;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f72585;
  }

  .status-indicator.connected .status-dot {
    background: #00f5d4;
    box-shadow: 0 0 8px #00f5d480;
    animation: pulse-dot 2s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .status-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #f72585;
  }

  .status-indicator.connected .status-text {
    color: #00f5d4;
  }

  .clock {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  .main-content {
    flex: 1;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
  }

  .top-rank-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .category-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
  }

  .category-header {
    padding-bottom: 8px 4px;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 8px;
    background: linear-gradient(90deg, #0d1321 0%, transparent 100%);
    border-radius: 8px;
  }

  .section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  .coffee-icon {
    background: #60a5fa20;
    color: #60a5fa;
    border: 1px solid #60a5fa40;
  }

  .tea-icon {
    background: #34d39920;
    color: #34d399;
    border: 1px solid #34d39940;
  }

  .section-title {
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: #e2e8f0;
    letter-spacing: 0.05em;
  }

  .section-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: #64748b;
    background: #1e293b;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .brand-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 32px;
    background: rgba(13, 19, 33, 0.6);
    border-top: 1px solid #1e293b;
  }

  .bottombar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .tick-label {
    font-size: 0.7rem;
    color: #475569;
    letter-spacing: 0.05em;
  }

  .tick-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #00f5d4;
    font-variant-numeric: tabular-nums;
  }

  .bottombar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sample-info {
    font-size: 0.65rem;
    color: #475569;
    letter-spacing: 0.05em;
    font-family: 'JetBrains Mono', monospace;
  }
</style>
