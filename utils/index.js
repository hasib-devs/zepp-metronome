export function assets(type) {
  return (path) => type + "/" + path;
}

export function debugLog(message) {
  console.log(`[DEBUG] ${message}`);
}

export class MetronomeEngine {
  constructor() {
    this.bpm = 120;
    this.timeSignature = { numerator: 4, denominator: 4 };
    this.isPlaying = false;
    this.currentBeat = 0;
    this.timer = null;
    this.onTick = null;
    this.minBpm = 30;
    this.maxBpm = 300;
  }

  setBpm(bpm) {
    if (bpm >= this.minBpm && bpm <= this.maxBpm) {
      this.bpm = bpm;
      if (this.isPlaying) {
        this.restart();
      }
    }
  }

  setTimeSignature(numerator, denominator) {
    this.timeSignature = { numerator, denominator };
    this.currentBeat = 0;
    if (this.onTick) {
      this.onTick(this.currentBeat, this.timeSignature);
    }
  }

  start() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.currentBeat = 0;
      this.scheduleNextBeat();
    }
  }

  stop() {
    this.isPlaying = false;
    this.currentBeat = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  scheduleNextBeat() {
    if (!this.isPlaying) return;

    const interval = 60000 / this.bpm;

    this.timer = setTimeout(() => {
      this.tick();
      this.scheduleNextBeat();
    }, interval);
  }

  tick() {
    if (this.onTick) {
      this.onTick(this.currentBeat, this.timeSignature);
    }

    this.currentBeat = (this.currentBeat + 1) % this.timeSignature.numerator;
  }

  getBeatInterval() {
    return 60000 / this.bpm;
  }
}

export class Storage {
  static save(key, value) {
    try {
      // In Zepp OS, we might use localStorage or device storage
      // For now, we'll store in memory and could extend this
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      debugLog(`Failed to save ${key}: ${error}`);
    }
  }

  static load(key, defaultValue = null) {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      }
    } catch (error) {
      debugLog(`Failed to load ${key}: ${error}`);
    }
    return defaultValue;
  }
}
