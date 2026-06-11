import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
}

type Tab = 'login' | 'register';

export default function AuthModal({ onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 주소를 입력해주세요. (예: example@email.com)');
      return;
    }

    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (tab === 'register' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const action = tab === 'login' ? login(email, password) : register(email, password);
    action
      .then(() => {
        alert(tab === 'login' ? '로그인되었습니다.' : '회원가입이 완료되었습니다.');
        setLoading(false);
        onClose();
      })
      .catch((err: Error) => {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        setLoading(false);
      });
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const inputClass =
    'border border-slate-300 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 text-sm ' +
    'text-slate-900 dark:text-slate-100 placeholder-slate-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-yellow-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex gap-4 text-sm font-medium">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={
                  tab === t
                    ? 'text-slate-900 dark:text-slate-100 border-b-2 border-yellow-500 pb-1'
                    : 'text-slate-400 dark:text-slate-500 pb-1 hover:text-slate-600 dark:hover:text-slate-300'
                }
              >
                {t === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">이메일</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {tab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-white dark:text-slate-900 font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}
