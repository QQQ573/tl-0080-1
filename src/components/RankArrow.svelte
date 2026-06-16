<script lang="ts">
  interface Props {
    rank: number;
    prevRank: number;
  }

  let { rank, prevRank }: Props = $props();

  let direction = $derived(rank < prevRank ? 'up' : rank > prevRank ? 'down' : 'same');
  let changed = $derived(rank !== prevRank);
  let rankDiff = $derived(Math.abs(rank - prevRank));

  let flashKey = $state(0);

  $effect(() => {
    if (rank !== prevRank) {
      flashKey++;
    }
  });
</script>

{#if changed}
  {#key flashKey}
    <div class="rank-arrow" class:up={direction === 'up'} class:down={direction === 'down'}>
      <div class="arrow-glow"></div>
      <div class="arrow-icon">
        {#if direction === 'up'}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 3L17 13H3L10 3Z" fill="currentColor"/>
          </svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 17L3 7H17L10 17Z" fill="currentColor"/>
          </svg>
        {/if}
      </div>
      {#if rankDiff > 1}
        <span class="rank-diff">{rankDiff}</span>
      {/if}
    </div>
  {/key}
{/if}

<style>
  .rank-arrow {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 6px;
    animation: flash-pulse 1.8s ease-out;
  }

  .rank-arrow.up {
    color: #00f5d4;
    background: #00f5d415;
    border: 1px solid #00f5d440;
  }

  .rank-arrow.down {
    color: #f72585;
    background: #f7258515;
    border: 1px solid #f7258540;
  }

  .arrow-glow {
    position: absolute;
    inset: -2px;
    border-radius: 8px;
    animation: glow-pulse 1.8s ease-out;
    pointer-events: none;
  }

  .rank-arrow.up .arrow-glow {
    background: radial-gradient(circle, #00f5d440 0%, transparent 70%);
  }

  .rank-arrow.down .arrow-glow {
    background: radial-gradient(circle, #f7258540 0%, transparent 70%);
  }

  .arrow-icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: bounce-arrow 1.8s ease-out;
  }

  .rank-diff {
    position: relative;
    z-index: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    animation: fade-slide 1.8s ease-out;
  }

  @keyframes flash-pulse {
    0% {
      transform: scale(1.5);
      opacity: 1;
      filter: brightness(2.5);
    }
    15% {
      transform: scale(1.1);
      opacity: 0.95;
      filter: brightness(1.6);
    }
    30% {
      transform: scale(1.35);
      opacity: 1;
      filter: brightness(2.2);
    }
    45% {
      transform: scale(1.05);
      opacity: 0.9;
      filter: brightness(1.4);
    }
    60% {
      transform: scale(1.2);
      opacity: 0.95;
      filter: brightness(1.7);
    }
    100% {
      transform: scale(1);
      opacity: 0.85;
      filter: brightness(1);
    }
  }

  @keyframes glow-pulse {
    0% {
      opacity: 1;
      transform: scale(1.4);
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }

  @keyframes bounce-arrow {
    0% {
      transform: translateY(-6px) scale(1.2);
    }
    30% {
      transform: translateY(2px) scale(0.95);
    }
    50% {
      transform: translateY(-3px) scale(1.1);
    }
    70% {
      transform: translateY(1px) scale(0.98);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fade-slide {
    0% {
      opacity: 0;
      transform: translateX(-4px);
    }
    40% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 1;
    }
  }
</style>
