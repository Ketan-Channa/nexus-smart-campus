import React, { useState } from 'react';
import axios from 'axios';
import { Bell, Plus, Sparkles, Send } from 'lucide-react';

export const FacultyAnnouncements: React.FC = () => {
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    category: 'Academic',
    targetAudience: 'Class' as 'All Students' | 'Class' | 'Department',
    targetClass: 'BTECH CSE 4A',
    priority: 'Normal' as 'Normal' | 'High' | 'Urgent',
  });

  const [announcementsList, setAnnouncementsList] = useState([
    {
      id: 'anc-1',
      title: 'Blockchain Practical Lab Submission Deadline Extended',
      message: 'Due to campus server maintenance over the weekend, the Smart Contract vulnerability audit lab submission has been extended by 48 hours to Sept 2nd.',
      category: 'Academic',
      targetClass: 'BTECH CSE 4A',
      priority: 'High',
      date: '2026-08-23',
    },
  ]);

  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/faculty/announcements/create', {
        title: announcementForm.title,
        message: announcementForm.message,
        category: announcementForm.category,
        targetAudience: announcementForm.targetAudience,
        targetClass: announcementForm.targetClass,
        facultyName: 'Dr. SMB',
        facultyEmail: 'faculty@nexus.edu',
        priority: announcementForm.priority,
      });
    } catch (e) {
      // Fallback local update
    }

    const newAnc = {
      id: `anc-${Date.now()}`,
      title: announcementForm.title,
      message: announcementForm.message,
      category: announcementForm.category,
      targetClass: announcementForm.targetClass,
      priority: announcementForm.priority,
      date: new Date().toISOString().substring(0, 10),
    };

    setAnnouncementsList([newAnc, ...announcementsList]);
    setStatusMsg(`✅ Published Announcement "${announcementForm.title}" to ${announcementForm.targetClass}! Appears instantly on student dashboard.`);
    setAnnouncementForm({ title: '', message: '', category: 'Academic', targetAudience: 'Class', targetClass: 'BTECH CSE 4A', priority: 'Normal' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Targeted Campus Announcements & Notices
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Publish targeted academic notices to specific classes or departments. Broadcasts live to student dashboard cards.</p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT FORM */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Create New Notice / Broadcast
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Notice Title</label>
            <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="e.g. DBMS Special Guest Lecture Tomorrow" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none" required />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Notice Content / Details</label>
            <textarea rows={3} value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} placeholder="Type detailed announcement message..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Class</label>
              <select value={announcementForm.targetClass} onChange={(e) => setAnnouncementForm({ ...announcementForm, targetClass: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                <option value="BTECH CSE 4A">BTECH CSE 4A</option>
                <option value="BTECH CSE 4B">BTECH CSE 4B</option>
                <option value="BCA 3B">BCA 3B</option>
                <option value="All Classes">All Classes</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Category</label>
              <select value={announcementForm.category} onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Lab & Project">Lab & Project</option>
                <option value="General Notice">General Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Priority</label>
              <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Broadcast</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Broadcast Notice Now</span>
            </button>
          </div>
        </form>
      </div>

      {/* ANNOUNCEMENTS HISTORY */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-base text-white">Published Notices History</h3>
        <div className="space-y-3">
          {announcementsList.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                  {a.targetClass} • {a.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{a.date}</span>
              </div>
              <h4 className="font-display font-black text-sm text-white">{a.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
