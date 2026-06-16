<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    history: number[];
    color: string;
    width?: number;
    height?: number;
  }

  let { history, color, width = 220, height = 52 }: Props = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animFrame: number | null = null;

  let previousData: number[] = [];
  let animationStart = 0;
  const ANIM_DURATION = 600;

  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  function interpolateData(from: number[], to: number[], t: number): number[] {
    const len = Math.max(from.length, to.length);
    const result: number[] = [];

    for (let i = 0; i < len; i++) {
      const fromVal = from[i] ?? from[from.length - 1] ?? to[i];
      const toVal = to[i] ?? to[0] ?? fromVal;
      result.push(fromVal + (toVal - fromVal) * t);
    }

    return result;
  }

  function draw(data: number[], w: number, h: number, progress: number = 1) {
    if (!ctx || data.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;
    const plotW = w - padding * 2;
    const plotH = h - padding * 2;

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * plotW,
      y: padding + plotH - ((v - min) / range) * plotH,
    }));

    const alphaGradient = Math.min(1, 0.1 + progress * 0.9);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + Math.floor(64 * alphaGradient).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, color + Math.floor(5 * alphaGradient).toString(16).padStart(2, '0'));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }

    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.globalAlpha = alphaGradient;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    const lastPointAlpha = Math.min(1, 0.2 + progress * 0.8);
    const glowPulse = 1 + (progress < 1 ? Math.sin(progress * Math.PI * 4) * 0.3 : 0);
    const glowRadius = 8 * glowPulse;

    const glow = ctx.createRadialGradient(
      lastPoint.x, lastPoint.y, 0,
      lastPoint.x, lastPoint.y, glowRadius
    );
    glow.addColorStop(0, color + Math.floor(255 * lastPointAlpha).toString(16).padStart(2, '0'));
    glow.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = lastPointAlpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function animateDraw(targetData: number[]) {
    if (animFrame) cancelAnimationFrame(animFrame);

    const fromData = previousData.length > 0 ? previousData : targetData;
    animationStart = performance.now();

    function step(now: number) {
      const elapsed = now - animationStart;
      const rawProgress = Math.min(elapsed / ANIM_DURATION, 1);
      const easedProgress = easeOutCubic(rawProgress);

      const interpolated = interpolateData(fromData, targetData, easedProgress);
      draw(interpolated, width, height, easedProgress);

      if (rawProgress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        previousData = [...targetData];
      }
    }

    animFrame = requestAnimationFrame(step);
  }

  $effect(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
    }
  });

  $effect(() => {
    if (ctx && history.length > 1) {
      animateDraw(history);
    }
  });

  onMount(() => {
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  });
</script>

<canvas bind:this={canvas} class="sparkline-canvas"></canvas>

<style>
  .sparkline-canvas {
    display: block;
  }
</style>
