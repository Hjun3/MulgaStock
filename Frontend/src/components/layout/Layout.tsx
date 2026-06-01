import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
