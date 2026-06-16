<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    value: number;
    color: string;
  }

  let { value, color }: Props = $props();

  let displayValue: number = $state(0);

  type AnimState = {
    frame: number | null;
    startVal: number;
    endVal: number;
    startTime: number;
  };

  const anim: AnimState = {
    frame: null,
    startVal: 0,
    endVal: 0,
    startTime: 0,
  };

  const DURATION = 800;

  function animateTo(target: number) {
    if (anim.frame !== null) {
      cancelAnimationFrame(anim.frame);
      anim.frame = null;
    }

    anim.startVal = displayValue;
    anim.endVal = target;
    anim.startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      displayValue = Math.round(anim.startVal + (anim.endVal - anim.startVal) * eased);

      if (progress < 1) {
        anim.frame = requestAnimationFrame(step);
      } else {
        anim.frame = null;
      }
    };

    anim.frame = requestAnimationFrame(step);
  }

  $effect(() => {
    if (displayValue === 0) {
      displayValue = value;
      return;
    }
    animateTo(value);
  });

  onMount(() => {
    return () => {
      if (anim.frame !== null) {
        cancelAnimationFrame(anim.frame);
      }
    };
  });
</script>

<span class="animated-number" style="color: {color}; text-shadow: 0 0 10px {color}40;">
  {displayValue.toLocaleString()}
</span>

<style>
  .animated-number {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    font-size: 2rem;
    line-height: 1;
    letter-spacing: -0.02em;
  }
</style>
