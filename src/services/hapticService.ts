class HapticService {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public triggerTap(): void {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(12); // Very short, crisp 12ms tactile feedback
    } catch {
      // Ignore if blocked by browser policy
    }
  }

  public triggerBeat(): void {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(8); // Subtle 8ms tick
    } catch {
      // Ignore
    }
  }

  public triggerCompletion(): void {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      // Gentle double pulse
      navigator.vibrate([25, 40, 35]);
    } catch {
      // Ignore
    }
  }
}

export const hapticService = new HapticService();
