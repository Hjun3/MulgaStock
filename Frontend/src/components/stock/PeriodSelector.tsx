import { cn } from '../../lib/cn';
import type { Period } from '../../api/types';

const PERIODS: Period[] = ['1W', '1M', '3M', '1Y', '5Y', 'ALL'];

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-bg-tertiary p-1" role="group" aria-label="기간 선택">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-pressed={value === p}
          className={cn(
            'rounded-md px-3 py-1.5 font-numeric text-sm font-medium transition-colors',
            value === p
              ? 'bg-bg-elevated text-text-primary shadow'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
