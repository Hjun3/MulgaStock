import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { PriceHistory } from '../../api/types';

interface Props {
  data: PriceHistory[];
}

export function CandleChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e1a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1c2333' },
        horzLines: { color: '#1c2333' },
      },
      rightPriceScale: { borderColor: '#2a3142' },
      timeScale: {
        borderColor: '#2a3142',
        timeVisible: true,
      },
      crosshair: { mode: 1 },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#94a3b840',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    const candleData = data.map((h) => ({
      time: h.date as `${number}-${number}-${number}`,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
    }));

    const volumeData = data.map((h) => ({
      time: h.date as `${number}-${number}-${number}`,
      value: h.volume,
      color: h.close >= h.open ? '#ef444430' : '#3b82f630',
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}
