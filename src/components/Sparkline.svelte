<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    history: number[];
    color: string;
    width?: number;
    height?: number;
  }

  let { history, color, width = 240, height = 56 }: Props = $props();

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  let hoverIndex: number | null = $state(null);
  let hoverValue: number | null = $state(null);
  let hoverPos = $state({ x: 0, y: 0 });

  let scrollAnimFrame: number | null = null;
  let lastHistoryRef: number[] | null = null;

  const PADDING_LEFT = 36;
  const PADDING_RIGHT = 8;
  const PADDING_TOP = 6;
  const PADDING_BOTTOM = 4;
  const SCROLL_DURATION = 500;
  const MAX_POINTS = 60;

  type Point = { x: number; y: number; value: number };

  function getMinMax(data: number[]): { min: number; max: number; range: number } {
    const validData = data.filter(v => !isNaN(v) && isFinite(v));
    if (validData.length < 2) {
      return { min: 0, max: 100, range: 100 };
    }
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const range = max - min || 1;
    const padding = range * 0.15;
    return { min: min - padding, max: max + padding, range: range + padding * 2 };
  }

  function getY(value: number, min: number, range: number, plotH: number): number {
    return PADDING_TOP + plotH - ((value - min) / range) * plotH;
  }

  function getX(index: number, plotW: number, offset: number = 0): number {
    return PADDING_LEFT + offset + (index / (MAX_POINTS - 1)) * plotW;
  }

  function cleanData(data: number[]): number[] {
    return data.filter(v => !isNaN(v) && isFinite(v));
  }

  function drawStatic(data: number[], w: number, h: number, scrollOffset: number = 0) {
    if (!ctx || data.length < 2) return;

    const validData = cleanData(data);
    if (validData.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const { min, max, range } = getMinMax(validData);
    const plotW = w - PADDING_LEFT - PADDING_RIGHT;
    const plotH = h - PADDING_TOP - PADDING_BOTTOM;

    ctx.strokeStyle = '#1e293b40';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    for (let i = 0; i <= 3; i++) {
      const ratio = i / 3;
      const y = PADDING_TOP + plotH * ratio;
      ctx.beginPath();
      ctx.moveTo(PADDING_LEFT, y);
      ctx.lineTo(w - PADDING_RIGHT, y);
      ctx.stroke();

      const value = max - range * ratio;
      ctx.fillStyle = '#475569';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value).toString(), PADDING_LEFT - 6, y);
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = '#1e293b60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT, PADDING_TOP);
    ctx.lineTo(PADDING_LEFT, h - PADDING_BOTTOM);
    ctx.stroke();

    const points: Point[] = validData.map((v, i) => ({
      x: getX(i, plotW, scrollOffset),
      y: getY(v, min, range, plotH),
      value: v,
    }));

    const gradient = ctx.createLinearGradient(0, PADDING_TOP, 0, h - PADDING_BOTTOM);
    gradient.addColorStop(0, color + '50');
    gradient.addColorStop(0.5, color + '25');
    gradient.addColorStop(1, color + '08');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    ctx.lineTo(lastPoint.x, h - PADDING_BOTTOM);
    ctx.lineTo(firstPoint.x, h - PADDING_BOTTOM);
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
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const dataPointInterval = Math.max(1, Math.floor(validData.length / 10));
    for (let i = 0; i < validData.length; i += dataPointInterval) {
      const p = points[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color + 'a0';
      ctx.fill();
    }

    const glow = ctx.createRadialGradient(
      lastPoint.x, lastPoint.y, 0,
      lastPoint.x, lastPoint.y, 10
    );
    glow.addColorStop(0, color + 'ff');
    glow.addColorStop(0.3, color + '80');
    glow.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length) {
      const hp = points[hoverIndex];
      ctx.setLineDash([4, 2]);
      ctx.strokeStyle = '#ffffff60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hp.x, PADDING_TOP);
      ctx.lineTo(hp.x, h - PADDING_BOTTOM);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const validData = cleanData(history);
    const plotW = width - PADDING_LEFT - PADDING_RIGHT;
    const dataLen = validData.length;

    if (x < PADDING_LEFT || x > width - PADDING_RIGHT || dataLen < 2) {
      hoverIndex = null;
      hoverValue = null;
      return;
    }

    const relativeX = x - PADDING_LEFT;
    const index = Math.round((relativeX / plotW) * (MAX_POINTS - 1));
    const clampedIndex = Math.max(0, Math.min(dataLen - 1, index));

    const value = validData[clampedIndex];
    if (isNaN(value) || !isFinite(value)) {
      hoverIndex = null;
      hoverValue = null;
      return;
    }

    hoverIndex = clampedIndex;
    hoverValue = Math.round(value);

    const { min, range } = getMinMax(validData);
    const plotH = height - PADDING_TOP - PADDING_BOTTOM;
    const dataY = getY(value, min, range, plotH);

    hoverPos = {
      x: getX(clampedIndex, plotW, 0),
      y: dataY,
    };

    drawStatic(history, width, height, 0);
  }

  function handleMouseLeave() {
    hoverIndex = null;
    hoverValue = null;
    drawStatic(history, width, height, 0);
  }

  function animateScroll(newData: number[], oldData: number[]) {
    if (scrollAnimFrame !== null) {
      cancelAnimationFrame(scrollAnimFrame);
    }

    const startTime = performance.now();
    const plotW = width - PADDING_LEFT - PADDING_RIGHT;

    function step(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / SCROLL_DURATION, 1);
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      const scrollOffset = -eased * (plotW / (MAX_POINTS - 1));

      const animData: number[] = [];
      for (let i = 0; i < MAX_POINTS; i++) {
        if (i === 0 && rawProgress < 1) {
          const oldVal = oldData[0] ?? newData[0];
          const nextVal = newData[0] ?? oldVal;
          animData.push(oldVal + (nextVal - oldVal) * eased);
        } else {
          const newIdx = i - 1;
          if (newIdx >= 0 && newIdx < newData.length) {
            animData.push(newData[newIdx]);
          } else if (i < oldData.length) {
            animData.push(oldData[i]);
          } else if (newData.length > 0) {
            animData.push(newData[newData.length - 1]);
          }
        }
      }

      drawStatic(animData, width, height, scrollOffset);

      if (rawProgress < 1) {
        scrollAnimFrame = requestAnimationFrame(step);
      } else {
        scrollAnimFrame = null;
        drawStatic(newData, width, height, 0);
      }
    }

    scrollAnimFrame = requestAnimationFrame(step);
  }

  $effect(() => {
    if (canvas) {
      ctx = canvas.getContext('2d');
    }
  });

  $effect(() => {
    const currentHistory = history;
    if (!ctx || currentHistory.length < 2) return;

    if (lastHistoryRef === null) {
      lastHistoryRef = [...currentHistory];
      drawStatic(currentHistory, width, height, 0);
    } else {
      const oldData = [...lastHistoryRef];
      lastHistoryRef = [...currentHistory];
      animateScroll([...currentHistory], oldData);
    }
  });

  onMount(() => {
    return () => {
      if (scrollAnimFrame !== null) {
        cancelAnimationFrame(scrollAnimFrame);
      }
    };
  });
</script>

<div class="sparkline-wrapper" bind:this={container}>
  <canvas
    bind:this={canvas}
    class="sparkline-canvas"
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
  ></canvas>
  {#if hoverIndex !== null && hoverValue !== null}
    <div class="tooltip" style="left: {hoverPos.x + 10}px; top: {hoverPos.y - 12}px;">
      <span class="tooltip-value" style="color: {color};">{hoverValue.toLocaleString()}</span>
      <span class="tooltip-index">#{hoverIndex + 1}</span>
    </div>
  {/if}
</div>

<style>
  .sparkline-wrapper {
    position: relative;
    display: inline-block;
  }

  .sparkline-canvas {
    display: block;
    cursor: crosshair;
  }

  .tooltip {
    position: absolute;
    transform: translateY(-50%);
    background: rgba(13, 19, 33, 0.95);
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .tooltip-value {
    font-family: JetBrains Mono, monospace;
    font-weight: 700;
    font-size: 0.75rem;
    text-shadow: 0 0 6px currentColor;
  }

  .tooltip-index {
    font-family: JetBrains Mono, monospace;
    font-size: 0.65rem;
    color: #64748b;
    background: #1e293b;
    padding: 1px 4px;
    border-radius: 3px;
  }
</style>
