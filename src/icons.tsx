const paths = {
  book: 'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4V4Zm16 0h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h3V4Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  repeat: 'M20 7h-5m5 0V2M4 17h5m-5 0v5M20 7a8 8 0 0 0-14-2M4 17a8 8 0 0 0 14 2',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  bulb: 'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  leaf: 'M5 19C1 9 11 3 20 4c0 9-3 17-12 14M5 19l10-10',
  close: 'm6 6 12 12M6 18 18 6',
} as const

export function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
