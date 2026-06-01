import { cn } from '../../lib/cn';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: Props) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-6', className)}>
      {children}
    </div>
  );
}
