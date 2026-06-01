import { cn } from '../../lib/cn';

interface Props {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
}

export function ChangeBadge({ value, size = 'md', showArrow = true }: Props) {
  const isUp = value > 0;
  const isDown = value < 0;

  const colorClass = isUp
    ? 'text-up bg-up-bg border border-up-border'
    : isDown
      ? 'text-down bg-down-bg border border-down-border'
      : 'text-flat bg-flat-bg border border-transparent';

  const sizeClass =
    size === 'sm'
      ? 'text-xs px-1.5 py-0.5'
      : size === 'lg'
        ? 'text-base px-3 py-1.5'
        : 'text-sm px-2 py-1';

  const arrow = showArrow ? (isUp ? '▲ ' : isDown ? '▼ ' : '– ') : '';
  const sign = isUp ? '+' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-numeric font-medium whitespace-nowrap',
        colorClass,
        sizeClass
      )}
    >
      {arrow}{sign}{value.toFixed(2)}%
    </span>
  );
}
