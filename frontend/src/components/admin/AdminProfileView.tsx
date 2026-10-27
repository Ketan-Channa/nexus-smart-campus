import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Save,
  RefreshCw,
  X,
  MapPin,
} from 'lucide-react';

interface AdminProfileViewProps {
  session?: any;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ session }) => {
  const adminEmail = session?.email || (session as any)?.user?.email || 'admin@nexus.edu';
  const [profile, setProfile] = useState<any>({
    admin_name: session?.name || 'Super Administrator',
    email: adminEmail,
    department: 'Central Administration',
    access_level: 'Super Admin',
    mobile: '+91 98765 43210',
    address: 'Central Admin Block, Room 101',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/admin/profile?email=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (data.status === 'success' && data.admin) {
        setProfile(data.admin);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [adminEmail]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          adminName: profile.admin_name,
          mobile: profile.mobile,
          address: profile.address,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        fetchProfile();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Administrator Credentials & Identity
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your official institutional profile, emergency contact, and administrative security credentials.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleUpdate} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Full Legal Name</label>
          <input
            type="text"
            required
            value={profile.admin_name || ''}
            onChange={(e) => setProfile({ ...profile, admin_name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Official University Email</label>
            <input
              type="email"
              disabled
              value={profile.email || ''}
              className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Contact Phone</label>
            <input
              type="text"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Administrative Department</label>
            <input
              type="text"
              disabled
              value={profile.department || 'Central Administration'}
              className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Institutional Access Level</label>
            <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
              {profile.access_level || 'Super Admin'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Office Location / Address</label>
          <input
            type="text"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Save className="w-3.5 h-3.5" />
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};
