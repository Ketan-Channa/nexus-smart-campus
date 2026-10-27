import React, { useState, useEffect } from 'react';
import {
  Users,
  Network,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  RefreshCw,
  Building2,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface AlumniConnectionsCentralProps {
  session: any;
  onOpenChatWithUser?: (targetEmail: string, targetName: string) => void;
}

export const AlumniConnectionsCentral: React.FC<AlumniConnectionsCentralProps> = ({
  session,
  onOpenChatWithUser,
}) => {
  const userEmail = session?.email || '';

  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'incoming' | 'sent'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, [userEmail]);

  // Listen to realtime socket events for live sync without manual refresh
  useEffect(() => {
    const handleReq = () => fetchConnections();
    const handleAcc = () => fetchConnections();
    const handleRej = () => fetchConnections();
    const handleRem = () => fetchConnections();

    window.addEventListener('connection.requested', handleReq);
    window.addEventListener('connection.accepted', handleAcc);
    window.addEventListener('connection.rejected', handleRej);
    window.addEventListener('connection.removed', handleRem);

    return () => {
      window.removeEventListener('connection.requested', handleReq);
      window.removeEventListener('connection.accepted', handleAcc);
      window.removeEventListener('connection.rejected', handleRej);
      window.removeEventListener('connection.removed', handleRem);
    };
  }, []);

  const fetchConnections = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/connections/requests?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setFriends(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setSentRequests(data.sentRequests || []);
      }
    } catch (e) {
      console.error('Error fetching connections:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, senderEmail: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await fetch('http://localhost:5000/api/connections/requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userEmail,
          senderEmail,
          action,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`Connection request ${action === 'ACCEPT' ? 'accepted' : 'declined'}!`);
        fetchConnections();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (targetEmail: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/connections/requests/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          targetEmail,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg('Connection request cancelled/removed.');
        fetchConnections();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredFriends = friends.filter((f) =>
    (f.full_name || f.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.current_company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Action Notification */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Header and SubTabs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              Shared Campus Connections Network
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bidirectional real-time networking connecting Alumni, Students, and Faculty across NEXUS.
            </p>
          </div>

          <button
            onClick={fetchConnections}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('friends')}
            className={`pb-3 flex items-center gap-2 relative ${
              activeSubTab === 'friends'
                ? 'text-indigo-600 dark:text-purple-400 border-b-2 border-indigo-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Connections ({friends.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('incoming')}
            className={`pb-3 flex items-center gap-2 relative ${
              activeSubTab === 'incoming'
                ? 'text-indigo-600 dark:text-purple-400 border-b-2 border-indigo-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Incoming Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('sent')}
            className={`pb-3 flex items-center gap-2 relative ${
              activeSubTab === 'sent'
                ? 'text-indigo-600 dark:text-purple-400 border-b-2 border-indigo-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sent Requests ({sentRequests.length})</span>
          </button>
        </div>
      </div>

      {/* 1. FRIENDS LIST VIEW */}
      {activeSubTab === 'friends' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter your connected friends by name, role, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {filteredFriends.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No connections in this view yet. Browse the Alumni Directory to send requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((frd, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 hover:border-indigo-400 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                      {frd.photograph_url || frd.avatar ? (
                        <img src={frd.photograph_url || frd.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (frd.full_name || frd.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {frd.full_name || frd.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {frd.current_designation || frd.department || 'Campus Member'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {frd.current_company || 'NEXUS Network'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        if (onOpenChatWithUser) {
                          onOpenChatWithUser(frd.email, frd.full_name || frd.name);
                        }
                      }}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-all"
                      title="Open Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(frd.email)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-all"
                      title="Remove Connection"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. INCOMING REQUESTS VIEW */}
      {activeSubTab === 'incoming' && (
        <div className="space-y-3">
          {incomingRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs text-slate-500">No pending incoming connection requests. You are all caught up!</p>
            </div>
          ) : (
            incomingRequests.map((req, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {req.photograph_url ? (
                      <img src={req.photograph_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      req.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                      {req.full_name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {req.current_designation || req.department} • {req.current_company}
                    </p>
                    {req.message && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleRespond(req.request_id, req.sender_email, 'ACCEPT')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRespond(req.request_id, req.sender_email, 'REJECT')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. SENT REQUESTS VIEW */}
      {activeSubTab === 'sent' && (
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No outgoing connection requests pending.</p>
            </div>
          ) : (
            sentRequests.map((req, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {req.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {req.full_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Pending acceptance by recipient • {req.email || req.receiver_email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCancel(req.email || req.receiver_email)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-bold transition-all"
                >
                  Withdraw Request
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
