import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentPaymentsViewProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentPaymentsView: React.FC<ParentPaymentsViewProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payingFeeId, setPayingFeeId] = useState<number | null>(null);
  const [payReceipt, setPayReceipt] = useState<any | null>(null);

  const fetchPayments = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/finance/payments?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [parentEmail, selectedChild?.roll_number]);

  const handlePay = async (feeItem: any) => {
    setPayingFeeId(feeItem.id);
    try {
      const res = await fetch('http://localhost:5000/api/parent/finance/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          studentRoll: selectedChild?.roll_number,
          feeId: feeItem.id,
          feeType: feeItem.fee_type,
          amount: feeItem.amount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPayReceipt(json);
        fetchPayments();
      } else {
        alert(json.message || 'Payment processing failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setPayingFeeId(null);
    }
  };

  const transactions = data?.transactions || [];
  const feeSummary = data?.studentFeeSummary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Campus Fees, Payments & Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional fee records, verified transaction ledger, and receipts for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Transactions</span>
        </button>
      </div>

      {/* Success Receipt Banner */}
      {payReceipt && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <strong>Payment Processed Successfully!</strong>
              <div>Official Receipt Number: <span className="font-mono font-bold">{payReceipt.receiptNo}</span> • Verified On: {new Date(payReceipt.paidOn).toLocaleString()}</div>
            </div>
          </div>
          <button
            onClick={() => setPayReceipt(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Institutional Fee Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tuition Fee Status</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">₹45,000 / Sem</div>
          <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ✓ Current Semester Dues Cleared
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hostel & Accommodation</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {feeSummary.hostel_fee ? `₹${feeSummary.hostel_fee}` : '₹35,000 / Sem'}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            Status: <strong className="text-slate-800 dark:text-slate-200">{feeSummary.hostel_payment_status || 'Verified'}</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transit / Bus Charges</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {feeSummary.bus_charges ? `₹${feeSummary.bus_charges}` : '₹12,000 / Year'}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            Status: <strong className="text-slate-800 dark:text-slate-200">{feeSummary.bus_payment_status || 'Pending'}</strong>
          </div>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          University Fee Ledger & Transaction History
        </h3>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Fee Item & Description</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((tx: any) => {
                  const isPaid = tx.payment_status === 'Paid';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {tx.fee_type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {tx.semester || 'Semester 4'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                        ₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {tx.due_date ? tx.due_date.slice(0, 10) : '2026-12-01'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-600 dark:text-teal-400">
                        {tx.receipt_no || '--'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {tx.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Verified Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePay(tx)}
                            disabled={payingFeeId === tx.id}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                          >
                            {payingFeeId === tx.id ? 'Processing...' : 'Pay Online'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No fee payment records found.
          </div>
        )}
      </div>
    </div>
  );
};
