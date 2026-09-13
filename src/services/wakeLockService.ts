interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

class WakeLockService {
  private sentinel: WakeLockSentinelLike | null = null;
  private isRequested: boolean = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'wakeLock' in navigator;
  }

  public async request(): Promise<boolean> {
    this.isRequested = true;
    if (!this.isSupported()) return false;

    try {
      if (this.sentinel && !this.sentinel.released) {
        return true;
      }
      const nav = navigator as unknown as { wakeLock: { request(type: string): Promise<WakeLockSentinelLike> } };
      this.sentinel = await nav.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch {
      return false;
    }
  }

  public async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // Ignore
      }
      this.sentinel = null;
    }
  }

  public handleVisibilityChange(): void {
    if (document.visibilityState === 'visible' && this.isRequested) {
      this.request().catch(() => {});
    }
  }
}

export const wakeLockService = new WakeLockService();

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    wakeLockService.handleVisibilityChange();
  });
}
