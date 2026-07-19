import { byId } from './dom';

export function announce(message: string): void {
  const liveRegion = byId<HTMLElement>('calculation-announcer');
  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 0);
}

export function focusErrorSummary(): void {
  const summary = byId<HTMLElement>('error-summary');
  summary.focus({ preventScroll: true });
  summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function revealResults(): void {
  const region = byId<HTMLElement>('calculation-results');
  const top = region.getBoundingClientRect().top;
  if (top > window.innerHeight * 0.72) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    region.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
}
