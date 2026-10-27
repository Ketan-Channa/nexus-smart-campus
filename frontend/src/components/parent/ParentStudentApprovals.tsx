import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  User,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentStudentApprovalsProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentStudentApprovals: React.FC<ParentStudentApprovalsProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [approvals, setApprovals] = useState<any>({ cards: [], medical: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [parentRemarks, setParentRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/approvals?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setApprovals(json.approvals || { cards: [], medical: [], documents: [] });
      }
    } catch (err) {
      console.error('Fetch approvals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [parentEmail, selectedChild?.roll_number]);

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/parent/approvals/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          category: selectedRequest.category,
          requestId: selectedRequest.id,
          consentStatus: 'Parent Consent Given',
          parentRemarks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApprovals();
        setSelectedRequest(null);
        setParentRemarks('');
      } else {
        alert(data.message || 'Failed to submit consent');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const cards = approvals.cards || [];
  const medical = approvals.medical || [];
  const documents = approvals.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Student Approvals & Guardian Consents
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional approvals, fest passes, medical leaves, and official consent workflows for {selectedChild?.full_name}
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* Cards & Passes Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Digital Cards & Fest Passes ({cards.length})
        </h3>

        {cards.length > 0 ? (
          <div className="space-y-3">
            {cards.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {c.card_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'Active' || c.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Requested on: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'} • {c.class_name}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequest({ id: c.id, category: 'card', title: c.card_type })}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs self-start sm:self-auto transition-all"
                >
                  Record Parent Consent
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            No active digital pass applications found.
          </div>
        )}
      </div>

      {/* Medical Certificates Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Medical Certificates & Leave Requests ({medical.length})
        </h3>

        {medical.length > 0 ? (
          <div className="space-y-3">
            {medical.map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {m.illness || 'Medical Leave Application'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Duration: {m.start_date} to {m.end_date} ({m.total_days || 1} Days) • Doctor: {m.doctor_name || 'Medical Practitioner'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequest({ id: m.id, category: 'medical', title: m.illness || 'Medical Leave' })}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs self-start sm:self-auto transition-all"
                >
                  Acknowledge / Endorse
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            No medical leave applications on file.
          </div>
        )}
      </div>

      {/* Modal: Parent Consent / Endorsement */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Endorse Request: {selectedRequest.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording parental consent verifies to Faculty that you acknowledge and permit this student request.
            </p>

            <form onSubmit={handleConsentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Parent Statement / Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={parentRemarks}
                  onChange={(e) => setParentRemarks(e.target.value)}
                  placeholder="e.g. As parent, I have verified and fully endorse this application."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
                >
                  {submitting ? 'Submitting...' : 'Sign & Endorse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
