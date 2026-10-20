export function getDueDateStatus(dueDateStr?: string): {
  label: string;
  badgeClass: string;
  isOverdue: boolean;
} | null {
  if (!dueDateStr) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDateStr.split('-').map(Number);
    if (!year || !month || !day) return null;

    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Vencida (${Math.abs(diffDays)}d)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
        isOverdue: true,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Vence hoy',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
        isOverdue: false,
      };
    } else if (diffDays === 1) {
      return {
        label: 'Vence mañana',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        isOverdue: false,
      };
    } else {
      return {
        label: `${dueDateStr}`,
        badgeClass: 'bg-slate-50 text-slate-500 border-slate-200/80',
        isOverdue: false,
      };
    }
  } catch {
    return null;
  }
}
