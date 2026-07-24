# 📊 StockScreener

A **professional real-time stock screener** built with modern web technologies. Features interactive candlestick charts, technical indicators, advanced filtering, and live price updates for 5000+ stocks.

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript 6** | Type-safe development |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | State management |
| **lightweight-charts** | Candlestick & indicator charting |
| **TanStack Virtual** | Virtualized table (10K+ rows) |
| **TanStack Table** | Sortable table logic |
| **React Icons** | Icon library |
| **Faker** | Realistic mock stock data |

## ✨ Features

- **📈 Interactive Candlestick Charts** — Powered by TradingView's lightweight-charts
- **📊 Technical Indicators** — SMA 20/50, EMA 12/26, Bollinger Bands
- **🔍 Advanced Filtering** — Filter by symbol, company, sector, price, volume, market cap, RSI, MACD
- **🏎️ Virtualized Table** — Smooth scrolling through 5000+ stocks
- **🔴 Live Price Updates** — Real-time price simulation
- **📱 Fully Responsive** — Desktop (3-column) → Tablet → Mobile
- **🌙 Dark Theme** — Modern dark UI with glass morphism effects

## 🖥️ Layout

```
Desktop (≥1024px)     Tablet (768-1023px)      Mobile (<768px)
┌────┬──────┬─────┐   ┌──────────────┐         ┌──────────────┐
│Flt │Table │Chart│   │   Filters    │         │   Filters    │
│rs  │      │+    │   ├──────────────┤         ├──────────────┤
│    │      │Indic│   │   StockTable │         │  StockTable  │
│    │      │     │   ├──────┬───────┤         ├──────────────┤
│    │      │     │   │Chart │ Tabs  │         │  Tab Bar     │
│    │      │     │   │ 50%  │ 50%   │         ├──────────────┤
│    │      │     │   │      │       │         │Tab Content   │
└────┴──────┴─────┘   └──────┴───────┘         └──────────────┘
```

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 👨‍💻 Developed by

**Himanshu Agarwal**