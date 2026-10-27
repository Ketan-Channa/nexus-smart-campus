import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  ArrowDownLeft,
} from 'lucide-react';

export const AdminPaymentsFinance: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total_txns: 0, total_collected: 0, total_dues: 0, total_refunded: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Refund Modal
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/payments/overview');
      const data = await res.json();
      if (data.status === 'success') {
        setPayments(data.payments || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn || !refundReason) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/payments/refund', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedTxn.id,
          reason: refundReason,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedTxn(null);
        setRefundReason('');
        fetchPayments();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Financial Ledger, Transactions & Fee Reconciliation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit institutional fees, verify payment gateway receipts, and execute audited refund adjustments.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Transactions</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{summary.total_txns || 0}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Authoritative Ledger
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Collections</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            ₹{Number(summary.total_collected || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Settled & Reconciled</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Outstanding Dues</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
            ₹{Number(summary.total_dues || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-300 mt-1">Pending Student Clearance</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Processed Refunds</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
            ₹{Number(summary.total_refunded || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-300 mt-1">Audited Reversals</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Roll</th>
                <th className="py-3 px-4">Fee Head</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading financial ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No payment records logged in system.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPaid = p.payment_status === 'Paid';
                  const isRefunded = p.payment_status === 'Refunded';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                        {p.student_roll_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{p.fee_type || 'Tuition Fee'}</span>
                        <div className="text-[10px] text-slate-400">Sem {p.semester || '7'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {p.razorpay_payment_id || p.receipt_no || 'MANUAL-REF'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : isRefunded
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {p.payment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPaid && (
                          <button
                            onClick={() => {
                              setSelectedTxn(p);
                              setRefundReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold border border-rose-500/20 transition text-[11px] inline-flex items-center gap-1"
                          >
                            <ArrowDownLeft className="w-3 h-3" />
                            Process Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Execute Audited Refund</h3>
              <button onClick={() => setSelectedTxn(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Student Roll: <strong className="text-indigo-300">{selectedTxn.student_roll_number}</strong></div>
              <div>Fee Head: <strong className="text-white">{selectedTxn.fee_type}</strong></div>
              <div>Amount to Reverse: <strong className="text-rose-400 font-mono text-sm">₹{selectedTxn.amount}</strong></div>
            </div>

            <form onSubmit={handleRefund} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Financial Audit Reason</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Scholarship waiver applied or duplicate payment reversed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
