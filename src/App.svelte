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

  let sortedBrands = $derived(
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

  <main class="card-area">
    {#each sortedBrands as brand (brand.brand)}
      <div animate:flip={{ duration: 600 }}>
        <BrandCard state={brand} />
      </div>
    {/each}
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

  .card-area {
    flex: 1;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
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
