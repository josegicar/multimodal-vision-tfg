export const syncGradient = (el: HTMLElement | null) => {
  if (el && !el.style.animationDelay) {
    el.style.animationDelay = `-${Date.now() % 4000}ms`;
  }
}