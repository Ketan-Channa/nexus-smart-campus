import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Clock,
  User,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentFeedbackViewProps {
  parentEmail: string;
  parentName?: string;
  selectedChild: LinkedStudent | null;
}

export const ParentFeedbackView: React.FC<ParentFeedbackViewProps> = ({
  parentEmail,
  parentName = 'Parent',
  selectedChild,
}) => {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Academic Progress');
  const [facultyEmail, setFacultyEmail] = useState('faculty@nexus.edu');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/feedback?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setFeedbackList(json.feedback || []);
      }
    } catch (err) {
      console.error('Fetch feedback error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [parentEmail, selectedChild?.roll_number]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/parent/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          parentName,
          studentRoll: selectedChild?.roll_number,
          studentName: selectedChild?.full_name,
          facultyEmail,
          feedbackCategory,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubject('');
        setMessage('');
        fetchFeedback();
        setShowSubmitModal(false);
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquarePlus className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Feedback, Questions & Suggestions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Submit formal inquiries and suggestions to faculty regarding {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeedback}
            disabled={loading}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all"
            title="Refresh Feedback"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Submit New Feedback</span>
          </button>
        </div>
      </div>

      {/* Submitted Feedback List */}
      <div className="space-y-4">
        {feedbackList.length > 0 ? (
          feedbackList.map((fb: any) => {
            const isResponded = fb.status === 'Responded';
            return (
              <div
                key={fb.feedback_id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200/50">
                      {fb.feedback_category || 'Academic'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isResponded
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Submitted: {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {fb.subject}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {fb.message}
                  </p>
                </div>

                {/* Faculty Response Box */}
                {fb.response_text ? (
                  <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/60 dark:border-teal-900/40 text-xs">
                    <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        Faculty Response from {fb.responded_by || 'Dr. SMB'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {fb.responded_at ? new Date(fb.responded_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                      "{fb.response_text}"
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    ⏳ Awaiting faculty review and response.
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <MessageSquarePlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Inquiries Submitted</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Have questions regarding course progression, grading, or campus amenities? Click "Submit New Feedback" to communicate directly with faculty.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Submit Feedback */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Submit Parent Inquiry / Suggestion
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Academic Progress">Academic Progress & Results</option>
                  <option value="Attendance & Leaves">Attendance & Leave Inquiries</option>
                  <option value="Hostel & Amenities">Hostel, Mess & Accommodation</option>
                  <option value="Transport & Commute">Transport & Route Support</option>
                  <option value="General Feedback">General Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query regarding Mid Semester Exam evaluation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Detailed Message / Suggestion *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete context for the faculty review committee..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
