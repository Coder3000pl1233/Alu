export function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount);
}

export function nextZoom(current: number, amount: number) {
  return Math.min(Math.max(Number((current + amount).toFixed(2)), 0.5), 1.75);
}
