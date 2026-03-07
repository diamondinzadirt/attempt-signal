'use client';
import { useEffect, useRef, useState } from 'react';

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
  reloadToken = 0
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let active = true;

    setLoading(true);
    setError('');

    const widgetNode = document.createElement('div');
    widgetNode.className = 'tradingview-widget-container__widget';
    widgetNode.style.width = '100%';
    widgetNode.style.height = `${height}px`;

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    script.onload = () => {
      if (!active) return;
      setLoading(false);
    };
    script.onerror = () => {
      if (!active) return;
      setError('Unable to load market widget.');
      setLoading(false);
    };

    container.replaceChildren(widgetNode, script);

    return () => {
      active = false;
      container.replaceChildren();
    };
  }, [scriptUrl, config, height, reloadToken]);

  return {
    containerRef,
    loading,
    error,
  };
};

export default useTradingViewWidget;
