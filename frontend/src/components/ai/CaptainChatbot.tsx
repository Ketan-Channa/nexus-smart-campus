import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Trash2,
  Database,
  ExternalLink,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';

interface CaptainChatbotProps {
  session?: UserSession | null;
  variant?: 'floating' | 'header';
  studentRoll?: string;
  targetClass?: string;
}

interface Message {
  id: string;
  sender: 'captain' | 'user';
  text: string;
  timestamp: string;
  provider?: string;
  sources?: string[];
  databaseFacts?: string[];
}

export const CaptainChatbot: React.FC<CaptainChatbotProps> = ({
  session,
  variant = 'header',
  studentRoll,
  targetClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const role = session?.role || 'Student';
  const userName = session?.name || 'Campus Member';
  const userEmail = session?.email || `${role.toLowerCase()}@nexus.campus.edu`;

  // Role-Aware Suggested Action Prompts
  const getRolePrompts = (r: string): string[] => {
    switch (r) {
      case 'Student':
        return [
          '📊 Check my attendance & exam eligibility',
          '📝 Show my published assessment marks',
          '📅 What is my schedule today?',
          '🎯 Career roadmap for Software Engineer',
        ];
      case 'Faculty':
        return [
          '⚠️ Show students below 75% attendance',
          '📝 Check pending assignment submissions',
          '📅 What is my teaching schedule today?',
          '📢 Draft a class notice',
        ];
      case 'Parent':
        return [
          "📊 How is my child's attendance standing?",
          '📝 Show published semester exam marks',
          '💳 Check pending fee payment dues',
          '🤝 How do I book a parent-faculty meeting?',
        ];
      case 'Alumni':
        return [
          '🤝 Any pending mentorship requests?',
          '🎤 Propose a guest lecture topic',
          '💼 Draft a job opening description',
          '🌐 Explore research collaborations',
        ];
      case 'Admin':
        return [
          '🏛️ Summarize campus health metrics',
          '📋 Pending verification approvals count',
          '🚨 Check active emergency alerts',
          '📢 Draft institutional circular',
        ];
      default:
        return [
          '📊 Check my attendance requirement',
          '📅 Show my schedule for today',
          '💳 How do I pay semester fees?',
          'ℹ️ Tell me about NEXUS Campus',
        ];
    }
  };

  const quickPrompts = getRolePrompts(role);

  const initialGreeting: Message = {
    id: 'init-1',
    sender: 'captain',
    text: `Hello ${userName}! 👋 I am **CAPTAIN**, your NEXUS ${role} AI Assistant. I am directly connected to the campus database to provide authorized, verified answers regarding attendance, published marks, lecture schedules, and institutional guidelines. How can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    provider: 'NEXUS Canonical Mesh',
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/ai/chat', {
        prompt: query,
        userRole: role,
        userEmail,
        userName,
        conversationId,
        studentRoll,
        targetClass,
      });

      const data = response.data;
      if (data && data.success) {
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        const captainMsg: Message = {
          id: `captain-${Date.now()}`,
          sender: 'captain',
          text: data.reply || 'Query processed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: data.provider || 'NEXUS Grounded AI Engine',
          sources: data.sourcesCited || [],
          databaseFacts: data.databaseFacts || [],
        };
        setMessages((prev) => [...prev, captainMsg]);
      } else {
        throw new Error(data?.message || 'Failed to process AI response.');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'captain',
        text: `⚠️ **Notice**: ${err.response?.data?.message || err.message || 'The AI microservice is currently updating. Please try again shortly.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'NEXUS Offline Safeguard',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([initialGreeting]);
    setConversationId('');
  };

  return (
    <>
      {variant === 'header' ? (
        /* HEADER HORIZONTAL CIRCULAR BUTTON */
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          title="CAPTAIN AI Assistant"
          className="relative flex items-center justify-center w-9.5 h-9.5 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-md border border-indigo-300/40 dark:border-purple-500/40 hover:border-cyan-300 transition-all duration-300"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
        </motion.button>
      ) : (
        /* FLOATING BOTTOM RIGHT CIRCULAR BUTTON */
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            title="CAPTAIN AI Assistant"
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white border border-indigo-300/40 dark:border-purple-500/40 shadow-xl backdrop-blur-xl group transition-all duration-300"
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
          </motion.button>
        </div>
      )}

      {/* CHATBOT DRAWER / MODAL WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed ${
              variant === 'header' ? 'top-16 right-4 sm:right-6' : 'bottom-22 right-4 sm:right-6'
            } z-50 w-[92vw] sm:w-[420px] h-[540px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-wide flex items-center gap-1.5">
                    <span>CAPTAIN</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[9px] font-bold tracking-normal">
                      {role.toUpperCase()} COPILOT
                    </span>
                  </h3>
                  <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" /> Database-Grounded AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear Conversation"
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'captain' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {/* Message Body with Markdown styling */}
                    <div className="whitespace-pre-wrap font-sans text-xs select-text">
                      {msg.text}
                    </div>

                    {/* Database Grounded Badge */}
                    {msg.sender === 'captain' && msg.databaseFacts && msg.databaseFacts.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Database className="w-3 h-3" />
                        <span>Verified from live campus records</span>
                      </div>
                    )}

                    {/* Footer with Timestamp, Provider & Copy */}
                    <div className="flex items-center justify-between text-[9px] opacity-70 pt-1 font-mono">
                      <span>{msg.provider ? `Engine: ${msg.provider}` : ''}</span>
                      <div className="flex items-center gap-2">
                        {msg.sender === 'captain' && (
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="hover:text-indigo-400 transition"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-center text-slate-400 text-xs italic p-1 animate-pulse">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <span>CAPTAIN is querying campus database & synthesizing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestions */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-purple-400 transition-all shrink-0 shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask CAPTAIN about ${role} records, policies, deadlines...`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
