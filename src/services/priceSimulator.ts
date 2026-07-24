// ============================================================
// WebSocket-like Price Simulator
// ============================================================
// Simulates real-time price updates using setInterval.
// Mimics a WebSocket connection pattern for realistic
// architecture. In production, this would be replaced with
// a real WebSocket connection.
// ============================================================

import type { Stock } from '../types/stock';
import { simulatePriceUpdate } from '../data/generateStocks';

type PriceUpdateCallback = (updatedStock: Stock) => void;
type BatchUpdateCallback = (updatedStocks: Stock[]) => void;

interface SimulatorState {
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  updateInterval: number; // ms
  batchSize: number;     // how many stocks to update per tick
}

class PriceSimulator {
  private state: SimulatorState = {
    isRunning: false,
    intervalId: null,
    updateInterval: 1000,  // update every second
    batchSize: 50,         // update 50 stocks per tick
  };

  private priceCallbacks: Set<PriceUpdateCallback> = new Set();
  private batchCallbacks: Set<BatchUpdateCallback> = new Set();
  private stocks: Stock[] = [];
  private currentIndex = 0;

  /**
   * Initialize the simulator with stock data.
   */
  init(stocks: Stock[]): void {
    this.stocks = stocks;
  }

  /**
   * Start simulating price updates.
   */
  start(): void {
    if (this.state.isRunning || this.stocks.length === 0) return;

    this.state.isRunning = true;
    this.state.intervalId = setInterval(() => {
      this.tick();
    }, this.state.updateInterval);

    console.log(
      `[PriceSimulator] Started: updating ${this.state.batchSize} stocks every ${this.state.updateInterval}ms`
    );
  }

  /**
   * Stop simulating price updates.
   */
  stop(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    console.log('[PriceSimulator] Stopped');
  }

  /**
   * Toggle the simulator on/off.
   */
  toggle(): boolean {
    if (this.state.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Check if simulator is running.
   */
  get isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Subscribe to individual price updates.
   * Returns unsubscribe function.
   */
  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.priceCallbacks.add(callback);
    return () => this.priceCallbacks.delete(callback);
  }

  /**
   * Subscribe to batch price updates.
   * Returns unsubscribe function.
   */
  onBatchUpdate(callback: BatchUpdateCallback): () => void {
    this.batchCallbacks.add(callback);
    return () => this.batchCallbacks.delete(callback);
  }

  /**
   * Internal tick: update a batch of stocks.
   */
  private tick(): void {
    const updatedStocks: Stock[] = [];
    const batchSize = Math.min(
      this.state.batchSize,
      this.stocks.length
    );

    for (let i = 0; i < batchSize; i++) {
      const idx = this.currentIndex % this.stocks.length;
      const updated = simulatePriceUpdate(this.stocks[idx]);

      // Update in-place in the array
      this.stocks[idx] = updated;
      updatedStocks.push(updated);

      // Fire individual callbacks
      this.priceCallbacks.forEach((cb) => cb(updated));

      this.currentIndex++;
    }

    // Fire batch callbacks
    this.batchCallbacks.forEach((cb) => cb(updatedStocks));
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<Pick<SimulatorState, 'updateInterval' | 'batchSize'>>): void {
    if (config.updateInterval !== undefined) {
      this.state.updateInterval = config.updateInterval;
    }
    if (config.batchSize !== undefined) {
      this.state.batchSize = config.batchSize;
    }

    // Restart if running to apply new interval
    if (this.state.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current configuration.
   */
  getConfig() {
    return {
      updateInterval: this.state.updateInterval,
      batchSize: this.state.batchSize,
      isRunning: this.state.isRunning,
    };
  }

  /**
   * Clean up all resources.
   */
  destroy(): void {
    this.stop();
    this.priceCallbacks.clear();
    this.batchCallbacks.clear();
    this.stocks = [];
  }
}

// Singleton instance
export const priceSimulator = new PriceSimulator();