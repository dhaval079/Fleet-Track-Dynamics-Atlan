// Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Navbar />
      </header>
      <main className="flex-grow w-full">
        <Outlet />             {/* child routes render here */}
      </main>
    </div>
  );
}
