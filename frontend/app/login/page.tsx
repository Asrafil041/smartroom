'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Guard: if already logged in, redirect to /rooms instead of showing login
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      // Use replace to avoid adding back button that triggers loop
      router.replace('/rooms');
    }
  }, [router]);

  const resetFeedback = () => {
    setMessage('');
    setIsError(false);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      if (!username || !password) {
        throw new Error('Username dan password harus diisi');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${API_URL}/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || 'Login gagal');
        }

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify({ id: data.user_id, username: data.username }));
        setMessage('✓ Login berhasil. Masuk ke ruang utama...');
        // Refresh route state before navigation to ensure layout re-renders
        router.refresh();
        setTimeout(() => router.push('/rooms'), 800);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Koneksi timeout. Silakan periksa koneksi internet Anda dan coba lagi.');
        }
        
        if (fetchError instanceof TypeError) {
          throw new Error('Tidak dapat terhubung ke layanan. Silakan periksa koneksi internet Anda.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      if (!username || !email || !password) {
        throw new Error('Semua field harus diisi');
      }

      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${API_URL}/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, email, password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || 'Registrasi gagal');
        }

        setMessage('✓ Registrasi berhasil. Silakan login.');
        setMode('login');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Koneksi timeout. Silakan periksa koneksi internet Anda dan coba lagi.');
        }
        
        if (fetchError instanceof TypeError) {
          throw new Error('Tidak dapat terhubung ke layanan. Silakan periksa koneksi internet Anda.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-10 text-[#f2e7ff]">
      <div className="absolute inset-0 opacity-70 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-[-80px] h-96 w-96 rounded-full bg-[#8a5fb5]/20 blur-3xl" />
        <div className="absolute top-24 right-[-100px] h-[28rem] w-[28rem] rounded-full bg-[#c8a8d8]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[20%] h-72 w-72 rounded-full bg-[#5f3d7a]/20 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center gap-10 lg:flex-row">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#8a5fb5]/50 bg-black/20 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#d8c8f8] shadow-[0_0_0_3px_rgba(18,9,31,0.4)]">
            <span>Smart Room</span>
            <span className="h-2 w-2 rounded-full bg-[#8a5fb5] shadow-[0_0_12px_rgba(138,95,181,0.9)]" />
            <span>Retro Learning Mode</span>
          </div>
          <h1 className="text-5xl font-black tracking-[0.12em] text-[#f5eaff] drop-shadow-[3px_3px_0_#12091f] sm:text-6xl">
            SMART ROOM
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d8c8f8]">
            Platform pembelajaran interaktif untuk menguasai teknologi Smart Home dengan cara yang menyenangkan dan mudah dipahami.
          </p>
          <div className="grid gap-3 text-sm text-[#c8a8d8] sm:grid-cols-2">
            <div className="rounded-2xl border border-[#5f3d7a] bg-[#3d2d4d]/85 p-4 shadow-[6px_6px_0_#12091f]">
              <p className="mb-2 font-bold uppercase tracking-[0.2em] text-[#f5eaff]">Pengalaman Belajar</p>
              <p>Nikmati simulasi interaktif yang dirancang khusus untuk memudahkan pemahaman konsep dasar pemrograman dan melatih kemampuan berpikir komputasional.</p>
            </div>

          </div>
        </div>

        <div className="w-full max-w-[460px] rounded-[28px] border-4 border-[#5f3d7a] bg-[#3d2d4d] p-4 shadow-[10px_10px_0_#12091f, inset_1px_1px_0_#8a5fb5, inset_-1px_-1px_0_#1a0f3f]">
          <div className="rounded-[20px] border-2 border-[#8a5fb5]/40 bg-[#2d1a5f]/90 p-5">
            <div className="mb-5 text-center">
              <div className="mb-2 text-5xl">🎮</div>
              <h2 className="text-3xl font-black tracking-[0.12em] text-[#f5eaff] drop-shadow-[2px_2px_0_#12091f]">
                Smart Room
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#c8a8d8]">
                Sistem Smart Home Interaktif
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-[#5f3d7a] bg-[#1f123f] text-sm font-bold uppercase tracking-[0.2em] text-[#f5eaff] shadow-[4px_4px_0_#12091f]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-4 py-3 transition ${mode === 'login' ? 'bg-[#8a5fb5] text-white' : 'bg-transparent text-[#c8a8d8]'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-4 py-3 transition ${mode === 'register' ? 'bg-[#8a5fb5] text-white' : 'bg-transparent text-[#c8a8d8]'}`}
              >
                Daftar
              </button>
            </div>

            {message ? (
              <div className={`mb-4 rounded-xl border-2 px-4 py-3 text-sm font-semibold ${isError ? 'border-[#d56b9d] bg-[#7b3c62] text-white' : 'border-[#8a5fb5] bg-[#47305f] text-[#f5eaff]'}`}>
                {message}
              </div>
            ) : null}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Username</label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Masukkan password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#8a5fb5] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_#12091f] transition hover:translate-y-[-1px] hover:bg-[#9d6fc9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Login'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Username</label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Pilih username"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Email opsional"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a8d8]">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#f1f3ff] px-4 py-3 text-sm text-[#1a1230] shadow-[inset_1px_1px_0_#fff] outline-none transition focus:bg-white"
                    placeholder="Ulangi password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border-2 border-[#5f3d7a] border-b-[#1a0f3f] border-r-[#1a0f3f] bg-[#8a5fb5] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_#12091f] transition hover:translate-y-[-1px] hover:bg-[#9d6fc9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Daftar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
