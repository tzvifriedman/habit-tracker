// All dates are stored as YYYY-MM-DD. "Today" is always the user's local date.

export function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days; // [oldest … today]
}

export function formatDisplayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).replace(',', ' ·');
}

export function computeStreak(
  completedDates: string[],
  referenceDate: string = today(),
): number {
  const set = new Set(completedDates);
  let streak = 0;
  const d = new Date(referenceDate + 'T00:00:00');
  while (true) {
    const key = d.toLocaleDateString('en-CA');
    if (!set.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
