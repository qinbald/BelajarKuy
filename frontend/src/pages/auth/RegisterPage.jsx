import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Gagal menghubungi server');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required
        value={form[name]}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? 'border-red-400' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        disabled={loading}
      />
      {errors[name] && (
        <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">BelajarKuy</h1>
          <p className="text-sm text-gray-500 mt-1">Buat akun belajar Anda</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Nama Lengkap', 'text', 'Nama Anda')}
          {field('email', 'Email', 'email', 'nama@email.com')}
          {field('password', 'Password', 'password', '••••••••')}
          {field('password_confirmation', 'Konfirmasi Password', 'password', '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
