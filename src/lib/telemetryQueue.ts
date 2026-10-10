/**
 * SafeDrive Telemetry Queue
 * Robust client-side queue for buffering telematics and kinetic safety data,
 * handling offline intervals, and flushing batches to the backend.
 */

import { api, TelemetryBatchPayload } from './api';

export interface TelemetryQueueItem {
  lat: number;
  lng: number;
  speed: number;
  speedLimit: number;
  brakingG: number;
  corneringG: number;
  kineticBufferSec: number;
  phoneDistraction: boolean;
  timestamp: number;
}

export type SyncStatus = 'idle' | 'buffering' | 'syncing' | 'synced' | 'offline_buffered';

class TelemetryQueueManager {
  private queue: TelemetryQueueItem[] = [];
  private syncTimer: any = null;
  private maxBatchSize = 12;
  private syncIntervalMs = 15000; // 15 seconds
  private status: SyncStatus = 'idle';
  private listeners: ((status: SyncStatus, pendingCount: number) => void)[] = [];
  private currentTripId?: string;

  constructor() {
    this.restoreFromStorage();
    this.setupNetworkListeners();
  }

  private restoreFromStorage() {
    try {
      const stored = localStorage.getItem('safedrive_telemetry_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistToStorage() {
    try {
      localStorage.setItem('safedrive_telemetry_queue', JSON.stringify(this.queue));
    } catch {
      // Ignore quota errors
    }
  }

  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushQueue();
      });
    }
  }

  public subscribe(cb: (status: SyncStatus, pendingCount: number) => void): () => void {
    this.listeners.push(cb);
    cb(this.status, this.queue.length);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.status, this.queue.length));
  }

  public startTrip(tripId: string) {
    this.currentTripId = tripId;
    this.status = 'buffering';
    this.notify();

    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        if (this.queue.length > 0) {
          this.flushQueue();
        }
      }, this.syncIntervalMs);
    }
  }

  public stopTrip() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    // Final flush
    this.flushQueue();
    this.currentTripId = undefined;
    this.status = 'synced';
    this.notify();
  }

  public pushSample(sample: TelemetryQueueItem) {
    this.queue.push(sample);
    this.persistToStorage();

    if (this.status !== 'syncing') {
      this.status = 'buffering';
    }
    this.notify();

    // Trigger flush if threshold reached
    if (this.queue.length >= this.maxBatchSize) {
      this.flushQueue();
    }
  }

  public async flushQueue(): Promise<void> {
    if (this.queue.length === 0 || this.status === 'syncing') return;

    this.status = 'syncing';
    this.notify();

    const batchToSend = [...this.queue.slice(0, 30)];
    const payload: TelemetryBatchPayload = {
      tripId: this.currentTripId,
      driverId: 'current-driver',
      timestamp: Date.now(),
      samples: batchToSend,
    };

    try {
      await api.submitTelemetryBatch(payload);
      // Remove sent items from memory and storage
      this.queue = this.queue.slice(batchToSend.length);
      this.persistToStorage();
      this.status = this.queue.length > 0 ? 'buffering' : 'synced';
    } catch {
      this.status = 'offline_buffered';
    } finally {
      this.notify();
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }
}

export const telemetryQueue = new TelemetryQueueManager();
