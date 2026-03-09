'use client';

import TradingViewWidget from '@/components/TradingViewWidget';
import {
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from '@/lib/constants';

const DashboardContent = () => {
  const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';

  return (
    <div className="flex min-h-screen home-wrapper">
      <section className="grid w-full gap-8 home-section">
        <div className="h-full md:col-span-1 xl:col-span-1">
          <TradingViewWidget title="Exciting News" scriptUrl={`${scriptUrl}timeline.js`} config={TOP_STORIES_WIDGET_CONFIG} height={600} />
        </div>

        <div className="md-col-span xl:col-span-2">
          <TradingViewWidget
            title="Asset Market Chart"
            symbol="NASDAQ:AAPL"
            interval="D"
            theme="dark"
            locale="en"
            className="custom-chart"
            height={600}
          />
        </div>
      </section>

      <section className="w-full gap-8 home-section">
        <h1 className="text-2xl font-bold w-full text-center mb-4">Check out the Market quotes prices for stocks in all sectors globally</h1>
       
        <div className="h-full md:col-span-1 xl:col-span-2 ">
          <TradingViewWidget  scriptUrl={`${scriptUrl}market-quotes.js`} config={MARKET_DATA_WIDGET_CONFIG} height={600} />
        </div>
      </section>
    </div>
  );
};

export default DashboardContent;
