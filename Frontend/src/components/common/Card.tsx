import { cn } from '../../lib/cn';

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-bg-secondary p-4',
        onClick && 'cursor-pointer transition-colors hover:bg-bg-tertiary',
        className
      )}
    >
      {children}
    </div>
  );
}
