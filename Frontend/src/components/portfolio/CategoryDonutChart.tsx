import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { StockDetail } from '../../api/types';

const CATEGORY_COLORS: Record<string, string> = {
  식품: '#ef4444',
  생필품: '#3b82f6',
  에너지: '#fbbf24',
  공산품: '#a78bfa',
};

interface Props {
  stocks: StockDetail[];
}

export function CategoryDonutChart({ stocks }: Props) {
  const counts: Record<string, number> = {};
  stocks.forEach((s) => {
    counts[s.category] = (counts[s.category] ?? 0) + 1;
  });

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <h3 className="mb-3 text-sm font-bold text-text-primary">카테고리 비중</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#64748b'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#252b3d', border: '1px solid #2a3142', borderRadius: 8 }}
            labelStyle={{ color: '#f8fafc' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
