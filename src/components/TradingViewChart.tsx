// components/TradingViewChart.tsx

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';

import { useGetTradingViewData } from '@/utils/api'


const TradingViewChart: React.FC<any> = ({ token }) => {
  console.log(token)
  const { data: tradingViewData, isLoading, refetch } = useGetTradingViewData(token);

  console.log(tradingViewData)

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!tradingViewData) return;
    const data = tradingViewData?.data?.data

    if (data && data.length) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { type: ColorType.Solid, color: '#000' },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: {
            color: '#334158',
          },
          horzLines: {
            color: '#334158',
          },
        },
        crosshair: {
          mode: CrosshairMode.Magnet,
        },
        timeScale: {
          borderColor: '#485c7b',
          timeVisible: true,
          secondsVisible: false,
          // tickMarkFormatter: (time: number) => moment(time * 1000).format('HH:mm'),
        },

        localization: {
          locale: 'en-US'
        }
      });

      const chart = chartRef.current;
      console.log(chart.addHistogramSeries)

      // Add candlestick series
      const candleSeries: ISeriesApi<'Candlestick'> = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceScaleId: 'right',
        priceFormat: {
          type: "custom",
          formatter: (price: number) => price.toFixed(18), // 强制保留 18 位小数
        },
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: 0,
            maxValue: Math.max(...data.map((item: any) => parseFloat(item.high))),
          },
          margins: {
            above: 100,
            below: 0,
          },
        }),
      });
      console.log(data)
      candleSeries.setData(data.map((item: any) => {
        return {
          time: item.time,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        }
      }));

      // Add volume histogram series 交易量可以作为柱状图显示在价格图表的下方。
      const volumeSeries = chart.addHistogramSeries({
        color: '#7c3aed',
        priceFormat: {
          type: "volume",
        },
        priceScaleId: 'left',
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: 0,
            maxValue: Math.max(...data.map((item: any) => parseFloat(item.volume))),
          },
          margins: {
            above: 100,
            below: 0,
          },
        }),

      });
      volumeSeries.setData(data.map((item: any) => ({
        time: item.time,
        value: parseFloat(item.volume),
      })));
      // volumeSeries.setData(volumeData);


      return () => {
        chart.remove();
        chartRef.current = null;
      };
    }


  }, [tradingViewData]);

  // Resize chart on container resizes
  // useEffect(() => {
  //   if (!chartContainerRef.current) return;

  //   resizeObserverRef.current = new ResizeObserver(entries => {
  //     const { width, height } = entries[0].contentRect;
  //     chartRef.current?.applyOptions({ width, height, timeScale: {
  //       timeVisible: true, // 确保时间显示
  //       secondsVisible: true, // 显示秒级时间
  //     }, });
  //     setTimeout(() => {
  //       chartRef.current?.timeScale().fitContent();
  //     }, 0);
  //   });

  //   resizeObserverRef.current.observe(chartContainerRef.current);

  //   return () => {
  //     resizeObserverRef.current?.disconnect();
  //   };
  // }, []);

  return (
    <div
      id="tradingview_chart"
      ref={chartContainerRef}
      style={{ height: '100%', width: '100%' }}
    ></div>
  );
};

export default TradingViewChart;
