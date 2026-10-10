// Background Telematics & Kinetic Speed Detection Engine
// Uses Web Worker background heartbeat, Screen Wake Lock API, Background Geolocation,
// and AudioContext keep-alive to ensure continuous ride tracking and speed detection
// even when the browser tab is hidden, screen is locked, or phone is in rider's pocket.

// Heartbeat worker script to bypass main-thread window.setInterval throttling in background tabs
const TIMER_WORKER_SCRIPT = `
let timerId = null;
let intervalMs = 1000;

self.onmessage = function(e) {
  const { action, interval } = e.data;
  if (action === 'START') {
    if (timerId) clearInterval(timerId);
    intervalMs = interval || 1000;
    timerId = setInterval(() => {
      self.postMessage({ type: 'TICK', timestamp: Date.now() });
    }, intervalMs);
    self.postMessage({ type: 'STARTED' });
  } else if (action === 'STOP') {
    if (timerId) clearInterval(timerId);
    timerId = null;
    self.postMessage({ type: 'STOPPED' });
  }
};
`;

export interface BackgroundTelematicsStatus {
  isBackgroundActive: boolean;
  isTabHidden: boolean;
  wakeLockActive: boolean;
  audioKeepAliveActive: boolean;
  pocketModeActive: boolean;
  backgroundTicksCount: number;
  lastBackgroundSpeed: number;
  batteryLevel: number | null;
  gpsState: 'active' | 'searching' | 'permission_denied' | 'idle';
}

type TelematicsTickListener = (data: { timestamp: number; isBackground: boolean }) => void;
type StatusListener = (status: BackgroundTelematicsStatus) => void;

class BackgroundTelematicsService {
  private timerWorker: Worker | null = null;
  private wakeLockSentinel: any = null;
  private audioCtx: AudioContext | null = null;
  private tickListeners: TelematicsTickListener[] = [];
  private statusListeners: StatusListener[] = [];
  private voiceAlertsEnabled = true;

  private status: BackgroundTelematicsStatus = {
    isBackgroundActive: false,
    isTabHidden: false,
    wakeLockActive: false,
    audioKeepAliveActive: false,
    pocketModeActive: false,
    backgroundTicksCount: 0,
    lastBackgroundSpeed: 0,
    batteryLevel: null,
    gpsState: 'idle',
  };

  constructor() {
    this.initTimerWorker();
    this.initVisibilityListener();
    this.initBatteryCheck();
  }

  private initTimerWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return;

    try {
      const blob = new Blob([TIMER_WORKER_SCRIPT], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.timerWorker = new Worker(workerUrl);

      this.timerWorker.onmessage = (e) => {
        if (e.data.type === 'TICK') {
          if (this.status.isTabHidden || this.status.pocketModeActive) {
            this.status.backgroundTicksCount += 1;
          }
          this.tickListeners.forEach((listener) =>
            listener({
              timestamp: e.data.timestamp,
              isBackground: this.status.isTabHidden || this.status.pocketModeActive,
            })
          );
          if (this.status.backgroundTicksCount % 10 === 0) {
            this.notifyStatus();
          }
        }
      };
    } catch (e) {
      console.warn('Background timer worker initialization error:', e);
    }
  }

  private initVisibilityListener() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      const isHidden = document.visibilityState === 'hidden';
      this.status.isTabHidden = isHidden;

      if (isHidden && this.status.isBackgroundActive) {
        // App went to background during ride
        this.speakTelematicsAlert('SafeDrive running in background. Continuous speed detection active.');
      } else if (!isHidden && this.status.isBackgroundActive) {
        this.speakTelematicsAlert('Ride active. Restored from background.');
      }

      this.notifyStatus();
    });
  }

  private initBatteryCheck() {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        this.status.batteryLevel = Math.round(battery.level * 100);
        this.notifyStatus();
        battery.addEventListener('levelchange', () => {
          this.status.batteryLevel = Math.round(battery.level * 100);
          this.notifyStatus();
        });
      }).catch(() => {});
    }
  }

  // Request Screen Wake Lock API to prevent device screen from sleeping
  public async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.status.wakeLockActive = true;
        this.wakeLockSentinel.addEventListener('release', () => {
          this.status.wakeLockActive = false;
          this.notifyStatus();
        });
        this.notifyStatus();
        return true;
      } catch (err) {
        console.warn('Screen WakeLock error:', err);
      }
    }
    return false;
  }

  // Release Screen Wake Lock
  public releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        this.status.wakeLockActive = false;
        this.notifyStatus();
      } catch (e) {
        // ignore
      }
    }
  }

  // Start Audio Keep-Alive Pulse (allows background location execution in mobile browsers)
  public startAudioKeepAlive() {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Generate a near-silent 20Hz subtle pulse every 15s to keep background thread warm
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(40, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      }, 500);

      this.status.audioKeepAliveActive = true;
      this.notifyStatus();
    } catch (e) {
      console.warn('Audio keep-alive warning:', e);
    }
  }

  // Hands-free Voice Alerts via Web Speech API
  public speakTelematicsAlert(message: string) {
    if (!this.voiceAlertsEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }

  // Start Background Telematics Session
  public startBackgroundSession() {
    this.status.isBackgroundActive = true;
    this.status.backgroundTicksCount = 0;
    this.requestWakeLock();
    this.startAudioKeepAlive();

    if (this.timerWorker) {
      this.timerWorker.postMessage({ action: 'START', interval: 1000 });
    }

    this.notifyStatus();
  }

  // Stop Background Telematics Session
  public stopBackgroundSession() {
    this.status.isBackgroundActive = false;
    this.status.pocketModeActive = false;
    this.releaseWakeLock();

    if (this.timerWorker) {
      this.timerWorker.postMessage({ action: 'STOP' });
    }

    this.notifyStatus();
  }

  // Toggle Pocket Mode (dim screen / black overlay while keeping GPS & neural active)
  public togglePocketMode() {
    this.status.pocketModeActive = !this.status.pocketModeActive;
    if (this.status.pocketModeActive) {
      this.speakTelematicsAlert('Pocket Mode engaged. Screen touch locked, background tracking active.');
    } else {
      this.speakTelematicsAlert('Pocket Mode disengaged.');
    }
    this.notifyStatus();
    return this.status.pocketModeActive;
  }

  public updateCurrentSpeed(speed: number) {
    this.status.lastBackgroundSpeed = speed;
  }

  public setVoiceAlerts(enabled: boolean) {
    this.voiceAlertsEnabled = enabled;
  }

  public subscribeTicks(listener: TelematicsTickListener) {
    this.tickListeners.push(listener);
    return () => {
      this.tickListeners = this.tickListeners.filter((l) => l !== listener);
    };
  }

  public subscribeStatus(listener: StatusListener) {
    this.statusListeners.push(listener);
    listener(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus() {
    this.statusListeners.forEach((l) => l({ ...this.status }));
  }

  public getStatus(): BackgroundTelematicsStatus {
    return { ...this.status };
  }
}

export const backgroundTelematicsService = new BackgroundTelematicsService();
