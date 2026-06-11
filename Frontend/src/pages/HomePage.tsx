import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketSummary, getTopStocks, getStockHistory, getStockDetail } from '../api';
import type { MarketSummary, StockSummary, StockDetail, PriceHistory } from '../types';
import {
  formatPrice,
  formatPercent,
  changeColor,
  barColor,
  formatDateTime,
  getWatchlist,
} from '../utils';
import { useTheme } from '../context/ThemeContext';

const MACRO = '거시지표';

interface History {
  category: string;
  points: PriceHistory[];
}

interface IndexPoint {
  date: string;
  value: number;
}

export default function HomePage() {
  const [market, setMarket] = useState<MarketSummary | null>(null);
  const [cpi, setCpi] = useState<StockDetail | null>(null);
  const [cpiSeries, setCpiSeries] = useState<IndexPoint[]>([]);
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [histories, setHistories] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const tickFill = isDark ? '#94a3b8' : '#475569';
  const tickFillMuted = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = isDark
    ? { background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' };
  const tooltipLabelStyle = isDark ? { color: '#94a3b8' } : { color: '#64748b' };

  useEffect(() => {
    Promise.all([
      getMarketSummary(),
      getTopStocks(200),
      getStockDetail('cpi').catch(() => null),
      getStockHistory('cpi', '1Y').catch(() => [] as PriceHistory[]),
    ])
      .then(([m, page, cpiDetail, cpiHist]) => {
        setMarket(m);
        setCpi(cpiDetail);
        setCpiSeries(cpiHist.map((p) => ({ date: p.date, value: p.close / 100 })));

        const products = page.content.filter((s) => s.category !== MACRO);
        setStocks(products);

        const members = products.filter((s) =>
          ['식품', '생필품', '에너지'].includes(s.category)
        );
        return Promise.all(
          members.map((s) =>
            getStockHistory(s.id, '3M')
              .then((points) => ({ category: s.category, points }))
              .catch(() => ({ category: s.category, points: [] as PriceHistory[] }))
          )
        );
      })
      .then((result) => setHistories(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (keyword.trim() !== '') {
      navigate('/search?q=' + encodeURIComponent(keyword.trim()));
    }
  }

  if (loading) {
    return <p className="text-center text-slate-600 dark:text-slate-400 py-20">불러오는 중...</p>;
  }
  if (error || !market) {
    return (
      <p className="text-center text-slate-600 dark:text-slate-400 py-20">
        데이터를 불러오지 못했습니다. (백엔드 서버가 켜져 있는지 확인해주세요)
      </p>
    );
  }

  const food = stocks.filter((s) => s.category === '식품');
  const daily = stocks.filter((s) => s.category === '생필품');
  const energy = stocks.filter((s) => s.category === '에너지');
  const top10 = stocks.slice(0, 10);

  const cpiIndex = cpi ? cpi.currentPrice / 100 : null;
  const cpiChange = cpi ? cpi.changePercent : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* ===== 1행: 검색창 ===== */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="품목 검색 (예: 치약, 닭고기, 휘발유)"
          className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-500"
        >
          검색
        </button>
      </form>

      {/* ===== 2행: 전체 물가지수(CPI, 좌) + 카테고리 시계열(우) ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">소비자물가지수 (CPI · 2020=100)</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                {cpiIndex !== null ? cpiIndex.toFixed(2) : '-'}
                <span className={'text-lg font-bold ml-2 ' + changeColor(cpiChange)}>
                  {formatPercent(cpiChange)}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                전월 대비 · 오늘 종목 상승 {market.gainersCount} · 하락 {market.losersCount}
              </p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full px-2 py-0.5">
              {formatDateTime(market.lastUpdated)} · 한국은행 ECOS
            </span>
          </div>

          <div className="mt-3 flex-1">
            {cpiSeries.length === 0 ? (
              <p className="text-center text-slate-500 py-16 text-sm">CPI 데이터가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={cpiSeries}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: tickFill, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={30}
                    tickFormatter={(d: string) => d.slice(0, 7)}
                  />
                  <YAxis
                    tick={{ fill: tickFillMuted, fontSize: 11 }}
                    domain={['auto', 'auto']}
                    width={44}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    formatter={(v) => [Number(v).toFixed(2), 'CPI']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#818cf8" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-lg p-3">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-1">✨ 오늘의 AI 시황</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{makeAiComment(market)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <MiniLine
            label="식품"
            avg={sectorAvg(market, '식품')}
            data={buildIndex(histories, (h) => h.category === '식품')}
          />
          <MiniLine
            label="생필품"
            avg={sectorAvg(market, '생필품')}
            data={buildIndex(histories, (h) => h.category === '생필품')}
          />
          <MiniLine
            label="에너지"
            avg={sectorAvg(market, '에너지')}
            data={buildIndex(histories, (h) => h.category === '에너지')}
          />
        </div>
      </section>

      {/* ===== 3행 + 4행 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryRank label="식품" stocks={food} />
            <CategoryRank label="생필품" stocks={daily} />
            <CategoryRank label="에너지" stocks={energy} />
          </section>

          <Top10Table stocks={top10} />
        </div>

        <aside className="lg:sticky lg:top-4 h-fit">
          <WatchlistSidebar />
        </aside>
      </div>
    </div>
  );
}

function MiniLine(props: { label: string; avg: number; data: IndexPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tickFill = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle = isDark
    ? { background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }
    : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', fontSize: 12 };
  const strokeColor = isDark ? barColor(props.avg) : (props.avg > 0 ? '#dc2626' : props.avg < 0 ? '#2563eb' : '#64748b');

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{props.label}</span>
        <span className={'text-lg font-bold ' + changeColor(props.avg)}>{formatPercent(props.avg)}</span>
      </div>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={props.data}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: tickFill }}
            formatter={(v) => [Number(v).toFixed(2), '지수']}
          />
          <Line type="monotone" dataKey="value" stroke={strokeColor} dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryRank({ label, stocks }: { label: string; stocks: StockSummary[] }) {
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">{label}</h3>

      <p className="text-xs text-red-500 dark:text-red-400 mb-1">▲ 급등 TOP 3</p>
      <ul className="space-y-1 mb-3">
        {gainers.map((s) => (
          <RankRow key={s.id} stock={s} />
        ))}
      </ul>

      <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">▼ 급락 TOP 3</p>
      <ul className="space-y-1">
        {losers.map((s) => (
          <RankRow key={s.id} stock={s} />
        ))}
      </ul>
    </div>
  );
}

function RankRow({ stock }: { stock: StockSummary }) {
  return (
    <li>
      <Link
        to={'/stocks/' + stock.id}
        className="flex items-center justify-between text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-0.5"
      >
        <span className="text-slate-700 dark:text-slate-300 truncate">{stock.name}</span>
        <span className={'font-medium ' + changeColor(stock.changePercent)}>
          {formatPercent(stock.changePercent)}
        </span>
      </Link>
    </li>
  );
}

function Top10Table({ stocks }: { stocks: StockSummary[] }) {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">전체 등락률 TOP 10</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs text-left border-b border-slate-200 dark:border-slate-800">
            <th className="py-2 w-8">#</th>
            <th className="py-2">종목</th>
            <th className="py-2">분류</th>
            <th className="py-2 text-right">현재가</th>
            <th className="py-2 text-right">등락률</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <tr key={s.id} className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
              <td className="py-2 text-slate-500">{i + 1}</td>
              <td className="py-2">
                <Link to={'/stocks/' + s.id} className="text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-300">
                  {s.name} <span className="text-slate-500 text-xs">{s.unit}</span>
                </Link>
              </td>
              <td className="py-2 text-slate-600 dark:text-slate-400">{s.category}</td>
              <td className="py-2 text-right text-slate-800 dark:text-slate-200">{formatPrice(s.currentPrice)}</td>
              <td className={'py-2 text-right font-medium ' + changeColor(s.changePercent)}>
                {formatPercent(s.changePercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function WatchlistSidebar() {
  const [items, setItems] = useState<StockDetail[]>([]);

  useEffect(() => {
    const ids = getWatchlist();
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => getStockDetail(id)))
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">⭐ 관심 목록</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          관심 종목이 없습니다.
          <br />
          종목 상세에서 추가해보세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                to={'/stocks/' + s.id}
                className="flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-1"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500">{formatPrice(s.currentPrice)}</p>
                </div>
                <span className={'text-sm font-medium ' + changeColor(s.changePercent)}>
                  {formatPercent(s.changePercent)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/portfolio"
        className="block mt-3 text-center text-xs text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200"
      >
        포트폴리오 전체 보기 →
      </Link>
    </div>
  );
}

function buildIndex(histories: History[], filter: (h: History) => boolean): IndexPoint[] {
  const selected = histories.filter(filter);
  const byDate = new Map<string, { sum: number; count: number }>();

  for (const h of selected) {
    if (h.points.length === 0) continue;
    const base = h.points[0].close;
    if (!base) continue;

    for (const p of h.points) {
      const index = (p.close / base) * 100;
      const cur = byDate.get(p.date) ?? { sum: 0, count: 0 };
      cur.sum += index;
      cur.count += 1;
      byDate.set(p.date, cur);
    }
  }

  return Array.from(byDate.entries())
    .map(([date, v]) => ({ date, value: Number((v.sum / v.count).toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function sectorAvg(market: MarketSummary, displayName: string) {
  const s = market.sectors.find((x) => x.displayName === displayName);
  return s ? s.averageChangePercent : 0;
}

function makeAiComment(market: MarketSummary) {
  const sectors = market.sectors.filter((s) => s.stockCount > 0 && s.displayName !== MACRO);
  if (sectors.length === 0) return '오늘의 시장 데이터를 정리하고 있습니다.';

  let top = sectors[0];
  let bottom = sectors[0];
  for (const s of sectors) {
    if (s.averageChangePercent > top.averageChangePercent) top = s;
    if (s.averageChangePercent < bottom.averageChangePercent) bottom = s;
  }
  const topPhrase = top.averageChangePercent > 0 ? '소폭 상승세' : '약세';
  return `${top.displayName} 중심으로 ${topPhrase}. ${bottom.displayName}는 조정 중입니다.`;
}
