import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentMessagingStudioProps {
  parentEmail: string;
  parentName?: string;
  selectedChild: LinkedStudent | null;
}

export const ParentMessagingStudio: React.FC<ParentMessagingStudioProps> = ({
  parentEmail,
  parentName = 'Parent',
  selectedChild,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [targetFacultyEmail, setTargetFacultyEmail] = useState('faculty@nexus.edu');
  const [targetFacultyName, setTargetFacultyName] = useState('Dr. SMB (Class Incharge)');

  const fetchMessages = async () => {
    if (!parentEmail || !targetFacultyEmail) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/connections/messages?user1=${encodeURIComponent(
          parentEmail
        )}&user2=${encodeURIComponent(targetFacultyEmail)}`
      );
      const json = await res.json();
      if (json.status === 'success') {
        setMessages(json.data || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [parentEmail, targetFacultyEmail]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/connections/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: parentEmail,
          senderName: parentName,
          senderRole: 'Parent',
          receiverEmail: targetFacultyEmail,
          receiverName: targetFacultyName,
          content: inputText.trim(),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setInputText('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Direct Faculty Messaging & Consultation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Secure communication regarding {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Thread</span>
        </button>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Recipient Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              F
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {targetFacultyName}
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                Official Campus Faculty Channel • {targetFacultyEmail}
              </div>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-400 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            Encrypted Channel
          </span>
        </div>

        {/* Message Bubble List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar bg-slate-50/40 dark:bg-slate-900/40">
          {messages.length > 0 ? (
            messages.map((m: any, idx: number) => {
              const isMe = m.sender_email?.toLowerCase() === parentEmail.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs shadow-sm ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mb-1">
                        {m.sender_name || 'Faculty Mentor'}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        isMe ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 text-slate-300" />
              <div className="text-xs font-semibold">No direct messages exchanged yet.</div>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                You can write a direct consultation note to {targetFacultyName} about {selectedChild?.full_name}'s academic progress.
              </p>
            </div>
          )}
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${targetFacultyName} regarding ${selectedChild?.full_name || 'student'}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md shadow-teal-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
