interface ScheduledTimer {
  id: number;
  time: number;
  cb: (...args: unknown[]) => void;
  args: unknown[];
}

class FakeTimers {
  private _time: number;
  private _nextId: number;
  private _timers: Map<number, ScheduledTimer>;

  constructor() {
    this._time = 0;
    this._nextId = 1;
    this._timers = new Map<number, ScheduledTimer>();
  }

  now(): number {
    return this._time;
  }

  setTimeout(cb: (...args: unknown[]) => void, delay: number = 0, ...args: unknown[]): number {
    const id = this._nextId++;
    const scheduledTime = this._time + Math.max(0, delay);
    this._timers.set(id, { id, time: scheduledTime, cb, args });
    return id;
  }

  clearTimeout(id: number): void {
    this._timers.delete(id);
  }

  advanceTimersByTime(ms: number): void {
    if (ms < 0) return; // 0 is allowed: it still runs timers that are already due
    const targetTime = this._time + ms;

    while (true) {
      let earliest: ScheduledTimer | null = null;
      for (const timer of this._timers.values()) {
        if (timer.time <= targetTime) {
          if (
            !earliest ||
            timer.time < earliest.time ||
            (timer.time === earliest.time && timer.id < earliest.id)
          ) {
            earliest = timer;
          }
        }
      }

      if (!earliest) break;

      this._time = earliest.time;
      this._timers.delete(earliest.id);
      earliest.cb(...earliest.args);
    }

    this._time = targetTime;
  }
}

function createFakeTimers(): FakeTimers {
  return new FakeTimers();
}
