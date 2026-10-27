import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Search,
  Check,
  CheckCheck,
  User,
  Clock,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  X,
  FileText,
} from 'lucide-react';

interface AlumniMessagingStudioProps {
  session: any;
  initialChatTargetEmail?: string | null;
  initialChatTargetName?: string | null;
}

export const AlumniMessagingStudio: React.FC<AlumniMessagingStudioProps> = ({
  session,
  initialChatTargetEmail = null,
  initialChatTargetName = null,
}) => {
  const currentEmail = session?.email || '';

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Contacts / Conversations from connected friends
  useEffect(() => {
    fetchContacts();
  }, [currentEmail]);

  // Realtime Socket.IO Listeners
  useEffect(() => {
    const handleNewMessage = (e: any) => {
      const msg = e.detail || e;
      if (
        (msg.senderEmail && activeContact?.email && msg.senderEmail.toLowerCase() === activeContact.email.toLowerCase()) ||
        (msg.sender && activeContact?.email && msg.sender.toLowerCase() === activeContact.email.toLowerCase())
      ) {
        setMessages((prev) => [...prev, {
          id: msg.id || msg.messageId || Date.now(),
          senderEmail: msg.senderEmail || msg.sender,
          receiverEmail: currentEmail,
          content: msg.content,
          timestamp: msg.timestamp || 'Just now',
          mediaUrl: msg.mediaUrl,
        }]);
      }
      fetchContacts();
    };

    window.addEventListener('message.created', handleNewMessage);
    window.addEventListener('chat:message', handleNewMessage);

    return () => {
      window.removeEventListener('message.created', handleNewMessage);
      window.removeEventListener('chat:message', handleNewMessage);
    };
  }, [activeContact, currentEmail]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial chat target if passed from directory
  useEffect(() => {
    if (initialChatTargetEmail) {
      const contactObj = {
        email: initialChatTargetEmail,
        full_name: initialChatTargetName || initialChatTargetEmail.split('@')[0],
      };
      setActiveContact(contactObj);
      fetchMessagesForUser(initialChatTargetEmail);
    }
  }, [initialChatTargetEmail, initialChatTargetName]);

  const fetchContacts = async () => {
    if (!currentEmail) return;
    try {
      const res = await fetch(`http://localhost:5000/api/connections/requests?userEmail=${encodeURIComponent(currentEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        const friendList = (data.friends || []).map((f: any) => ({
          email: f.email,
          full_name: f.full_name || f.name,
          photograph_url: f.photograph_url || f.avatar,
          current_designation: f.current_designation || f.department,
        }));
        setConversations(friendList);

        if (!activeContact && friendList.length > 0 && !initialChatTargetEmail) {
          setActiveContact(friendList[0]);
          fetchMessagesForUser(friendList[0].email);
        }
      }
    } catch (e) {
      console.error('Error fetching contacts:', e);
    }
  };

  const fetchMessagesForUser = async (targetEmail: string) => {
    if (!currentEmail || !targetEmail) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/connections/messages?user1=${encodeURIComponent(currentEmail)}&user2=${encodeURIComponent(targetEmail)}`
      );
      const data = await res.json();
      if (data.status === 'success') {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    const messageText = inputText.trim();
    setInputText('');

    const optimisticMessage = {
      id: `MSG-${Date.now()}`,
      senderEmail: currentEmail,
      receiverEmail: activeContact.email,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await fetch('http://localhost:5000/api/connections/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentEmail,
          receiverEmail: activeContact.email,
          content: messageText,
        }),
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* LEFT: CONVERSATIONS LIST */}
      <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Messages & Chat
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No contacts available. Connect with students or alumni first.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeContact?.email === c.email;
              return (
                <div
                  key={c.email}
                  onClick={() => {
                    setActiveContact(c);
                    fetchMessagesForUser(c.email);
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                    {c.photograph_url ? (
                      <img src={c.photograph_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      c.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white truncate">
                      {c.full_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {c.current_designation || c.email}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: CHAT THREAD VIEW */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/40">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                  {activeContact.photograph_url ? (
                    <img src={activeContact.photograph_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    activeContact.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                    {activeContact.full_name}
                  </h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected & Ready for Realtime Chat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Starting video room for ${activeContact.full_name}`)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loadingMessages ? (
                <div className="text-center text-xs text-slate-400 py-8">Loading conversation history...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Start the conversation!</h4>
                  <p className="text-[11px] text-slate-400">Send advice, share opportunities, or answer career queries.</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = (m.senderEmail || m.sender || '').toLowerCase() === currentEmail.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                        {m.timestamp || 'Recently'}
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Type message to ${activeContact.full_name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white shadow-md transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <p className="text-xs">Select a contact from the left pane to open chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};
