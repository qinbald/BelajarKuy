import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, User, Info, Lock, Settings, Bell, Volume2 } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState('umum');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    institution: user?.institution || '',
    default_passing_grade: user?.default_passing_grade || 75,
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
    sound_enabled: true,
    notifications_enabled: false,
  });

  // Sync data on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab('umum');
      setPreviewUrl(user?.avatar_url || null);
      setSelectedFile(null);
      setFormData({
        name: user?.name || '',
        institution: user?.institution || '',
        default_passing_grade: user?.default_passing_grade || 75,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        sound_enabled: true,
        notifications_enabled: false,
      });
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleOverlayClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // 1. Upload Avatar
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('avatar', selectedFile);
        const resAvatar = await client.post('/profile/avatar', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (resAvatar.data.success) {
          setUser(resAvatar.data.data.user);
        }
      }

      // 2. Update Profile & Security
      const payload = {
        name: formData.name,
        institution: formData.institution,
        default_passing_grade: formData.default_passing_grade,
        sound_enabled: formData.sound_enabled,
        notifications_enabled: formData.notifications_enabled,
      };

      if (formData.new_password) {
        payload.current_password = formData.current_password;
        payload.password = formData.new_password;
        payload.password_confirmation = formData.new_password_confirmation;
      }

      const resProfile = await client.put('/profile', payload);
      
      if (resProfile.data.success) {
        setUser(resProfile.data.data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-20">
          <h2 className="text-lg font-bold text-slate-800">Pengaturan Profil</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area with Sidebar */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          
          {/* Tabs Sidebar */}
          <div className="w-full sm:w-56 bg-slate-50/50 border-r border-slate-100 flex sm:flex-col gap-1 p-3 overflow-x-auto shrink-0">
            {[
              { id: 'umum', label: 'Profil Umum', icon: User },
              { id: 'keamanan', label: 'Keamanan', icon: Lock },
              { id: 'preferensi', label: 'Preferensi', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* TAB: UMUM */}
            {activeTab === 'umum' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center shrink-0">
                    <div 
                      className="relative group cursor-pointer w-20 h-20 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm" 
                      onClick={handleOverlayClick}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <span className="text-xs text-slate-400 mt-2 font-medium">Maks. 2MB</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input 
                      type="email" value={user?.email || ''} disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Institusi/Kampus <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input 
                      type="text" name="institution" value={formData.institution} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Contoh: Universitas Brawijaya"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Target Nilai Bawaan (%)</label>
                    <div className="group relative flex items-center">
                      <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg text-center pointer-events-none z-10">
                        Batas minimal nilai untuk peringatan zona kritis.
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="number" name="default_passing_grade" value={formData.default_passing_grade} onChange={handleInputChange} min="0" max="100"
                    className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB: KEAMANAN */}
            {activeTab === 'keamanan' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm text-slate-500 mb-2">Kosongkan jika tidak ingin mengubah sandi.</p>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi Saat Ini</label>
                  <input 
                    type="password" name="current_password" value={formData.current_password} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi Baru</label>
                  <input 
                    type="password" name="new_password" value={formData.new_password} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" name="new_password_confirmation" value={formData.new_password_confirmation} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* TAB: PREFERENSI */}
            {activeTab === 'preferensi' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-6">
                  {/* Toggle: Audio */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Suara Peringatan Timer</h4>
                        <p className="text-xs text-slate-500">Mainkan nada saat sesi belajar selesai.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" name="sound_enabled" checked={formData.sound_enabled} onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Toggle: Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Notifikasi Browser</h4>
                        <p className="text-xs text-slate-500">Tampilkan notifikasi melayang di sistem.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" name="notifications_enabled" checked={formData.notifications_enabled} onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0 z-20">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-600/20"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

      </div>
    </div>
  );
}
