'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Item {
  id: string;
  title: string;
  description: string;
  type: 'laboratory' | 'room';
  difficulty: 'easy' | 'medium' | 'hard';
  is_accessible: boolean;
  requirement?: string;
  completion_rate: number;
  image: string;
}

const RETRO_ITEMS: Item[] = [
  {
    id: 'kamar-utama',
    title: 'ruang belajar utama',
    description: 'Cari perangkat didalam ruang ini yang dapat diinteraksi lalu perbaiki masalahnya dengan susunan blok yang benar.',
    type: 'room',
    difficulty: 'easy',
    is_accessible: true,
    completion_rate: 0,
    image: '/asset/bg_kamar.png',
  },
  {
    id: 'room-lighting',
    title: 'smart lighting',
    description: 'Ruang pembelajaran lanjutan yang masih terkunci sampai aset dan skenario pembelajarannya tersedia.',
    type: 'room',
    difficulty: 'medium',
    is_accessible: false,
    requirement: 'Ruang ini akan dibuka setelah ruangan sebelumnya berhasil diselesaikan.',
    completion_rate: 0,
    image: '/asset/bg_kamar.png',
  },
  {
    id: 'room-security',
    title: 'sistem keamanan',
    description: 'Ruang pembelajaran lanjutan yang masih terkunci sampai aset dan skenario pembelajarannya tersedia.',
    type: 'room',
    difficulty: 'hard',
    is_accessible: false,
    requirement: 'Ruang ini akan dibuka setelah ruangan sebelumnya berhasil diselesaikan.',
    completion_rate: 0,
    image: '/asset/bg_kamar.png',
  },
];

function RetroCard({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  const difficultyLabel = useMemo(() => {
    if (item.difficulty === 'easy') return 'MUDAH';
    if (item.difficulty === 'medium') return 'MENENGAH';
    return 'SULIT';
  }, [item.difficulty]);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      disabled={!item.is_accessible}
      className={`group relative overflow-hidden rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] text-left shadow-[8px_8px_0_#12091f, inset_1px_1px_0_#8a5fb5] transition-transform duration-200 ${
        item.is_accessible ? 'hover:-translate-y-1 hover:scale-[1.01]' : 'cursor-not-allowed opacity-60'
      }`}
    >
      <div className="relative h-44 overflow-hidden border-b-4 border-[#5f3d7a] bg-[#2d1a5f]">
        <Image src={item.image} alt={item.title} fill className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12091f] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border-2 border-[#c8a8d8] bg-[#12091f]/70 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#f5eaff]">
          {item.type === 'laboratory' ? 'LAB' : 'SIMULASI'}
        </div>
        <div className="absolute right-4 top-4 rounded-full border-2 border-[#8a5fb5] bg-[#2d1a5f]/90 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#f5eaff]">
          {difficultyLabel}
        </div>
        {!item.is_accessible ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-5xl">🔒</div>
        ) : null}
      </div>

      <div className="p-5 text-[#f2e7ff]">
        <h3 className="mb-2 text-xl font-black tracking-[0.08em] text-[#f5eaff] drop-shadow-[2px_2px_0_#12091f]">{item.title}</h3>
        <p className="mb-4 min-h-[4.5rem] text-sm leading-6 text-[#d8c8f8]">{item.description}</p>

        {item.requirement ? (
          <div className="mb-4 rounded-2xl border-2 border-[#d56b9d] bg-[#7b3c62] px-4 py-3 text-xs font-semibold text-white shadow-[4px_4px_0_#12091f]">
            <span className="mb-1 block font-black uppercase tracking-[0.18em]">Persyaratan</span>
            {item.requirement}
          </div>
        ) : null}

        {item.is_accessible && item.completion_rate > 0 ? (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#c8a8d8]">
              <span>Progress</span>
              <span>{Math.round(item.completion_rate * 100)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-[#1a0f3f] bg-[#1f123f]">
              <div className="h-full bg-gradient-to-r from-[#8a5fb5] to-[#d8c8f8]" style={{ width: `${item.completion_rate * 100}%` }} />
            </div>
          </div>
        ) : null}

        <div className={`border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_#12091f] ${item.is_accessible ? 'bg-[#8a5fb5] text-white' : 'bg-[#2d1a5f] text-[#c8a8d8]'}`}>
          {item.is_accessible ? 'Masuk Ruangan' : 'Terkunci'}
        </div>
      </div>
    </button>
  );
}

export default function RoomsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Player');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/check-auth/`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = (await response.json()) as { authenticated?: boolean; username?: string };

        if (!response.ok || !data.authenticated) {
          // Backend auth check failed. In development cross-origin setups the
          // session cookie may not be set; fall back to client-local session
          // stored in localStorage to avoid redirect loops.
          const local = localStorage.getItem('isLoggedIn');
          const storedUser = localStorage.getItem('user');
          if (local === 'true' && storedUser) {
            try {
              const parsed = JSON.parse(storedUser) as { username?: string };
              if (parsed.username) setUserName(parsed.username);
            } catch {}
            // keep local session and continue
          } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            router.replace('/login');
            return;
          }
        } else {
          localStorage.setItem('isLoggedIn', 'true');
          if (data.username) {
            setUserName(data.username);
            localStorage.setItem('user', JSON.stringify({ username: data.username }));
          }
        }
      } catch {
        // On network or fetch error, allow dev-local session if present to avoid
        // infinite redirect/reload loops caused by cross-origin cookie issues.
        const local = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('user');
        if (local === 'true' && storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as { username?: string };
            if (parsed.username) setUserName(parsed.username);
          } catch {}
          // continue to app with local session
        } else {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          router.replace('/login');
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    void checkAuth();
  }, [router]);

  const rooms = RETRO_ITEMS.filter((item) => item.type === 'room');

  const performLogout = async () => {
    try {
      await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Tetap lanjut cleanup lokal jika request logout gagal.
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  };

  const handleLogout = () => {
    setConfirmTitle('Logout akun');
    setConfirmMessage('Skor dan progress Anda akan tetap tersimpan. Apakah Anda yakin ingin keluar?');
    setConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    void performLogout();
  };

  const handleCancelLogout = () => {
    setConfirmOpen(false);
  };

  const handleSelect = (item: Item) => {
    if (!item.is_accessible) return;
    router.push(`/simulation/${item.id}`);
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen px-4 py-6 text-[#f2e7ff]">
        <div className="mx-auto max-w-7xl rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-6 text-center shadow-[8px_8px_0_#12091f]">
          Memverifikasi sesi login...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-[#f2e7ff]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[28px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-4 shadow-[10px_10px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-3 rounded-full border border-[#8a5fb5]/50 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#d8c8f8]">
                <span>Smart Room</span>
                <span className="h-2 w-2 rounded-full bg-[#8a5fb5]" />
                <span>Retro Hub</span>
              </div>
              <h1 className="text-4xl font-black tracking-[0.14em] text-[#f5eaff] drop-shadow-[3px_3px_0_#12091f]">RUANG UTAMA</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8c8f8]">Pilih ruangan untuk masuk ke simulasi pembelajaran interaktif.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border-2 border-[#5f3d7a] bg-[#2d1a5f] px-4 py-3 text-sm shadow-[4px_4px_0_#12091f]">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-[#c8a8d8]">Pemain aktif</span>
                <span className="font-black text-[#f5eaff]">{userName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#d56b9d] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_#12091f] transition hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-[0.08em] text-[#f5eaff]">🏠 Kamar / Ruangan</h2>
              <p className="text-sm text-[#c8a8d8]">Ruang utama digunakan untuk mempelajari cara mengontrol dua perangkat pintar. Ruang lanjutan tetap terkunci sampai materinya tersedia.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((item) => (
              <RetroCard key={item.id} item={item} onSelect={handleSelect} />
            ))}
          </div>
        </section>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[24px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-6 shadow-[12px_12px_0_#12091f, inset_1px_1px_0_#8a5fb5]">
            <h3 className="text-2xl font-black text-[#f5eaff]">{confirmTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-[#d8c8f8]">{confirmMessage}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full rounded-2xl border-2 border-[#2f7a3a] bg-[#22c55e] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#0b3f1f] transition hover:bg-[#1f8f4f] sm:w-auto"
              >
                Ya, logout
              </button>
              <button
                type="button"
                onClick={handleCancelLogout}
                className="w-full rounded-2xl border-2 border-[#7a2f3a] bg-[#ef4444] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#3b0f0f] transition hover:bg-[#d33a3a] sm:w-auto"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
