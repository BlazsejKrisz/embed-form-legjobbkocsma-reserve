const params = new URLSearchParams(window.location.search)

const CSS_VARS: Array<[string, string, string]> = [
  ['primary',    '--lk-primary',    '#111827'],
  ['primary_fg', '--lk-primary-fg', '#ffffff'],
  ['font',       '--lk-font',       'inherit'],
  ['radius',     '--lk-radius',     '6px'],
  ['border',     '--lk-border',     '#e5e7eb'],
  ['text',       '--lk-text',       '#111827'],
  ['muted',      '--lk-muted',      '#6b7280'],
  ['bg',         '--lk-bg',         'transparent'],
]

export function applyTheme(): void {
  for (const [param, cssVar, fallback] of CSS_VARS) {
    document.documentElement.style.setProperty(cssVar, params.get(param) ?? fallback)
  }
  const font = params.get('font')
  if (font && font !== 'inherit') {
    document.body.style.fontFamily = font
  }
}

export function getParam(key: string): string | null {
  return params.get(key)
}
