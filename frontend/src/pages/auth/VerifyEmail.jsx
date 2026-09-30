import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import client from '../../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Memverifikasi Otorisasi Markas...');

  useEffect(() => {
    const verifyToken = async () => {
      const id = searchParams.get('id');
      const hash = searchParams.get('hash');

      if (!id || !hash) {
        setStatus('error');
        setMessage('Tautan Kadaluarsa/Tidak Valid');
        return;
      }

      try {
        const res = await client.get(`/email/verify/${id}/${hash}`);
        if (res.data.success) {
          setStatus('success');
          setMessage('Verifikasi Berhasil! Silakan Masuk');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Tautan Kadaluarsa/Tidak Valid');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center">
        <div className="mb-6 flex justify-center">
          {status === 'loading' && <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-300" />}
          {status === 'error' && <XCircle className="w-16 h-16 text-red-500 animate-in zoom-in duration-300" />}
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Verifikasi Email</h2>
        <p className="text-sm font-medium text-slate-600 mb-8">{message}</p>

        {status !== 'loading' && (
          <button 
            onClick={() => navigate('/login')}
            className="w-full px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            {status === 'success' ? 'Masuk ke Markas' : 'Kembali ke Login'}
          </button>
        )}
      </div>
    </div>
  );
}
