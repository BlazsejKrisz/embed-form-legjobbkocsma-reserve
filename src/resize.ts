export function sendResize(): void {
  requestAnimationFrame(() => {
    window.parent.postMessage({ type: 'lk:resize', height: document.documentElement.scrollHeight }, '*')
  })
}
