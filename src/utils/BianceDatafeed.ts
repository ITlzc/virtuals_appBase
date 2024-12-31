export class BinanceDataFeed {
    onReady(callback: (config: any) => void) {
      console.log('onReady called');
      const config = {
        supports_marks: false,
        supports_time: true,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
      };
      setTimeout(() => callback(config), 0);
    }
  
    resolveSymbol(symbolName: string, onSymbolResolvedCallback: (symbolInfo: any) => void) {
      console.log('resolveSymbol called with symbol:')
      const symbolInfo = {
        name: symbolName,
        ticker: symbolName,
        description: `${symbolName} on Binance`,
        type: 'crypto',
        session: '24x7',
        exchange: 'Binance',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
        volume_precision: 2,
        data_status: 'streaming',
      };
      setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
    }
  
    getBars(
      symbolInfo: any,
      resolution: string,
      from: number,
      to: number,
      onHistoryCallback: (bars: any[], { noData }: { noData: boolean }) => void,
      onErrorCallback: (reason: string) => void
    ) {
      console.log(`getBars called with symbol: ${symbolInfo.ticker}, resolution: ${resolution}, from: ${from}, to: ${to}`)
      const interval = this.mapResolution(resolution);
      fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbolInfo.ticker}&interval=${interval}&startTime=${from * 1000}&endTime=${to * 1000}`
      )
        .then((response) => response.json())
        .then((data) => {
          const bars = data.map((item: any) => ({
            time: item[0], // 开盘时间 (毫秒)
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
          }));
          onHistoryCallback(bars, { noData: bars.length === 0 });
        })
        .catch((error) => {
          console.error('Error fetching Binance data:', error);
          onErrorCallback('Error fetching data');
        });
    }
  
    subscribeBars(
      symbolInfo: any,
      resolution: string,
      onRealtimeCallback: (bar: any) => void,
      subscriberUID: string
    ) {
      const interval = this.mapResolution(resolution);
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbolInfo.ticker.toLowerCase()}@kline_${interval}`
      );
  
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.k.x) {
          const bar = {
            time: message.k.t,
            open: parseFloat(message.k.o),
            high: parseFloat(message.k.h),
            low: parseFloat(message.k.l),
            close: parseFloat(message.k.c),
            volume: parseFloat(message.k.v),
          };
          onRealtimeCallback(bar);
        }
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  
    mapResolution(resolution: string): string {
      const resolutionMap: { [key: string]: string } = {
        '1': '1m',
        '5': '5m',
        '15': '15m',
        '30': '30m',
        '60': '1h',
        'D': '1d',
        'W': '1w',
        'M': '1M',
      };
      return resolutionMap[resolution] || '1m';
    }
  }
  