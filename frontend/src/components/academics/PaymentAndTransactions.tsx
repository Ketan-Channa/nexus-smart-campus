import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ArrowUpRight,
  ShieldCheck,
  X,
  Check,
  Plus,
  FileText,
  Building2,
  Sparkles,
  Trash2,
  Coins,
  QrCode,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { type UserSession } from '../../types/auth';

export interface FeeOrTransactionItem {
  id: string;
  txnId?: string;
  title: string;
  category:
    | 'Semester Tuition'
    | 'End Sem Exam'
    | 'Canteen & Dining'
    | 'Hostel & Mess'
    | 'Transport & Parking'
    | 'Events & Fests'
    | 'Fines & Dues';
  amount: number;
  dueDate?: string;
  paidDate?: string;
  paymentMode?: 'Razorpay UPI' | 'NetBanking' | 'Credit/Debit Card' | 'Pay at Counter';
  status: 'Pending' | 'Paid' | 'Overdue';
  description: string;
  academicYear: string;
  receiptNumber?: string;
  postedBy?: string;
}

interface PaymentAndTransactionsProps {
  session?: UserSession | null;
}

export const PaymentAndTransactions: React.FC<PaymentAndTransactionsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 100% Dynamic Dues & Transactions state (NO hardcoded initial data)
  const [pendingDues, setPendingDues] = useState<FeeOrTransactionItem[]>([]);
  const [completedTxns, setCompletedTxns] = useState<FeeOrTransactionItem[]>([]);

  // Checkout Modal State
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<FeeOrTransactionItem | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Razorpay UPI' | 'NetBanking' | 'Credit/Debit Card' | 'Pay at Counter'>('Razorpay UPI');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [upiIdInput, setUpiIdInput] = useState('student@okicici');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Admin Mode State (Allows Admin/Faculty to post dues dynamically)
  const userRole = (session?.role as string) || 'Student';
  const isAdminMode = userRole === 'Admin' || userRole === 'Faculty' || userRole === 'Administrator';
  const [isAddDueModalOpen, setIsAddDueModalOpen] = useState(false);

  // Admin New Due Form Inputs
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<FeeOrTransactionItem['category']>('Semester Tuition');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAcademicYear, setNewAcademicYear] = useState('2025-2026');
  const [newDescription, setNewDescription] = useState('');

  // Dynamic Student Info from session (NO hardcoded names/roll numbers)
  const studentName = session?.name || 'Authorized Campus User';
  const studentIdentifier = session?.email || 'NEXUS-ID-VERIFIED';

  // Load transactions from localStorage and purge any legacy hardcoded data
  const loadData = () => {
    try {
      const savedPending = localStorage.getItem('nexus_pending_dues');
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        // Purge legacy hardcoded demo IDs if present
        const cleaned = parsed.filter(
          (item: any) =>
            !['due-1', 'due-2', 'due-3', 'due-4', 'due-5'].includes(item.id)
        );
        setPendingDues(cleaned);
      } else {
        setPendingDues([]);
      }

      const savedCompleted = localStorage.getItem('nexus_completed_transactions');
      if (savedCompleted) {
        const parsed = JSON.parse(savedCompleted);
        // Purge legacy hardcoded demo IDs if present
        const cleaned = parsed.filter(
          (item: any) =>
            !['txn-101', 'txn-102', 'txn-103', 'txn-104'].includes(item.id)
        );
        setCompletedTxns(cleaned);
      } else {
        setCompletedTxns([]);
      }
    } catch (e) {
      console.error('Failed to load transaction data:', e);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('nexus_payment_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nexus_payment_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Admin Posts New Fee Due
  const handleAdminCreateDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || parseFloat(newAmount) <= 0) {
      alert('Please provide a valid fee title and amount.');
      return;
    }

    const createdDue: FeeOrTransactionItem = {
      id: `due-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      amount: parseFloat(newAmount),
      dueDate: newDueDate,
      status: 'Pending',
      description: newDescription || `Official ${newCategory} posted by Campus Administration.`,
      academicYear: newAcademicYear,
      postedBy: session?.name || 'Campus Finance Admin',
    };

    const updatedPending = [createdDue, ...pendingDues];
    setPendingDues(updatedPending);
    localStorage.setItem('nexus_pending_dues', JSON.stringify(updatedPending));
    window.dispatchEvent(new Event('nexus_payment_updated'));

    setNewTitle('');
    setNewAmount('');
    setNewDescription('');
    setIsAddDueModalOpen(false);
    alert(`✅ SUCCESS: Fee Due "${createdDue.title}" (₹${createdDue.amount}) successfully posted to Student Portal!`);
  };

  // Admin Deletes a Pending Due
  const handleDeleteDue = (id: string) => {
    if (!confirm('Are you sure you want to remove this fee due from student portal?')) return;
    const updatedPending = pendingDues.filter((d) => d.id !== id);
    setPendingDues(updatedPending);
    localStorage.setItem('nexus_pending_dues', JSON.stringify(updatedPending));
    window.dispatchEvent(new Event('nexus_payment_updated'));
  };

  // Process Fee Payment
  const handleProcessPayment = () => {
    if (!activeCheckoutItem) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const txnId = `NEX-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const receiptNo = `RCP-PAY-${Math.floor(10000 + Math.random() * 90000)}`;

      let formattedPaymentMode = paymentMode as string;
      if (paymentMode === 'NetBanking') {
        formattedPaymentMode = `NetBanking (${selectedBank})`;
      } else if (paymentMode === 'Razorpay UPI') {
        formattedPaymentMode = `Razorpay UPI (${upiIdInput || 'UPI Pay'})`;
      }

      const paidItem: FeeOrTransactionItem = {
        ...activeCheckoutItem,
        txnId: txnId,
        paidDate: nowStr,
        paymentMode: formattedPaymentMode as any,
        status: 'Paid',
        receiptNumber: receiptNo,
      };

      // Update Pending & Completed lists
      const updatedPending = pendingDues.filter((d) => d.id !== activeCheckoutItem.id);
      const updatedCompleted = [paidItem, ...completedTxns];

      setPendingDues(updatedPending);
      setCompletedTxns(updatedCompleted);

      localStorage.setItem('nexus_pending_dues', JSON.stringify(updatedPending));
      localStorage.setItem('nexus_completed_transactions', JSON.stringify(updatedCompleted));

      window.dispatchEvent(new Event('nexus_payment_updated'));

      setIsProcessingPayment(false);
      setActiveCheckoutItem(null);

      alert(`🎉 PAYMENT SUCCESSFUL!\n\nTransaction ID: ${txnId}\nReceipt No: ${receiptNo}\nAmount Paid: ₹${activeCheckoutItem.amount.toLocaleString()}`);
    }, 1500);
  };

  // Generate & Download Tax Receipt PDF
  const handleDownloadReceiptPDF = (txn: FeeOrTransactionItem) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NEXUS SMART CAMPUS UNIVERSITY', 74, 9, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL ELECTRONIC PAYMENT RECEIPT & TAX INVOICE', 74, 15, { align: 'center' });

      // Meta Box
      doc.setFillColor(248, 250, 252);
      doc.rect(8, 26, 132, 22, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(8, 26, 132, 22, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt No: ${txn.receiptNumber || 'RCP-NEXUS-01'}`, 12, 32);
      doc.text(`Transaction ID: ${txn.txnId || 'NEX-TXN-0000'}`, 12, 37);
      doc.text(`Payment Mode: ${txn.paymentMode || 'Razorpay UPI'}`, 12, 42);

      doc.text(`Student: ${studentName}`, 80, 32);
      doc.text(`Identifier: ${studentIdentifier}`, 80, 37);
      doc.text(`Date: ${txn.paidDate || 'Today'}`, 80, 42);

      // Itemized Table
      doc.setFillColor(241, 245, 249);
      doc.rect(8, 52, 132, 7, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Description / Fee Group', 12, 56.5);
      doc.text('Academic Period', 75, 56.5);
      doc.text('Amount (INR)', 115, 56.5);

      doc.setFont('helvetica', 'normal');
      doc.text(txn.title.substring(0, 35), 12, 65);
      doc.text(txn.academicYear, 75, 65);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${txn.amount.toLocaleString()}`, 115, 65);

      // Tax Breakdown
      doc.line(8, 72, 140, 72);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Subtotal Amount: Rs. ${txn.amount.toLocaleString()}`, 90, 77);
      doc.text('Applicable GST (0% Educational Exemption): Rs. 0.00', 90, 81);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Amount Paid: Rs. ${txn.amount.toLocaleString()}`, 90, 87);

      // Notes & Digital Stamp
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Note: ${txn.description}`, 12, 95);

      doc.line(15, 112, 55, 112);
      doc.text('Accounts & Finance Officer', 18, 115);

      doc.line(90, 112, 130, 112);
      doc.text('Controller of Finance (CoF)', 92, 115);

      // Footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 198, 148, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text('NEXUS CAMPUS PAY • COMPUTER GENERATED VERIFIED RECEIPT', 74, 204, { align: 'center' });

      doc.save(`nexus_receipt_${txn.txnId || 'payment'}.pdf`);
    } catch (e) {
      alert('Error generating PDF receipt.');
    }
  };

  // Top Statistics Calculations
  const totalPendingAmount = pendingDues.reduce((sum, d) => sum + d.amount, 0);
  const totalPaidAmount = completedTxns.reduce((sum, t) => sum + t.amount, 0);

  // Filter Functions
  const filteredPending = pendingDues.filter(
    (d) =>
      (selectedCategory === 'All' || d.category === selectedCategory) &&
      (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredHistory = completedTxns.filter(
    (t) =>
      (selectedCategory === 'All' || t.category === selectedCategory) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.txnId?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const CATEGORY_LIST = [
    'All',
    'Semester Tuition',
    'End Sem Exam',
    'Canteen & Dining',
    'Hostel & Mess',
    'Transport & Parking',
    'Events & Fests',
    'Fines & Dues',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* REDESIGNED NEXUS BRANDED HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            NEXUS Smart Campus OS • Central Financial & Payments Hub
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            Fee Payment & Financial Billing Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            Encrypted university portal for Semester Tuition, Examination Fees, Canteen Billing, Hostel Dues, Transport, Fests & Digital Tax Invoices.
          </p>
        </div>

        {/* Dynamic Metrics */}
        <div className="flex items-center gap-3 z-10">
          <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
            <span className="text-[10px] text-indigo-200 uppercase tracking-wider block font-bold">Outstanding Dues</span>
            <strong className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              ₹{totalPendingAmount.toLocaleString()}
            </strong>
          </div>

          <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
            <span className="text-[10px] text-indigo-200 uppercase tracking-wider block font-bold">Completed Payments</span>
            <strong className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ₹{totalPaidAmount.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* SUB OPTIONS: NAVIGATION TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Fees & Dues ({pendingDues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Transactions ({completedTxns.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search fee title, transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* SUB OPTIONS: CATEGORY GROUP CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TAB 1: PENDING FEES & DUES */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Academic Fees & Campus Dues
            </h3>
            <span className="text-xs text-amber-500 font-bold">
              {filteredPending.length} Fee Items Outstanding
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-400/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">All Academic Dues Clear!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                There are no pending fees or dues posted by administration at this moment. New fees added by admins will automatically appear here.
              </p>
              {isAdminMode && (
                <button
                  onClick={() => setIsAddDueModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post First Fee Due (Admin Action)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPending.map((due) => (
                <motion.div
                  key={due.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                        {due.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            due.status === 'Overdue'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {due.status} • Due: {due.dueDate}
                        </span>
                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteDue(due.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Fee Due"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-display font-black text-base text-slate-900 dark:text-white pt-1">
                      {due.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {due.description}
                    </p>
                    {due.postedBy && (
                      <span className="text-[10px] text-slate-400 italic block">Posted by: {due.postedBy}</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        Payable Amount
                      </span>
                      <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        ₹{due.amount.toLocaleString()}
                      </strong>
                    </div>

                    <button
                      onClick={() => setActiveCheckoutItem(due)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-1.5"
                    >
                      <span>Pay Now</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED TRANSACTIONS & RECEIPTS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Completed App Transactions & Official Receipts
            </h3>
            <span className="text-xs text-emerald-500 font-bold">
              Total Paid: ₹{totalPaidAmount.toLocaleString()}
            </span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">No Completed Transactions Yet</h4>
              <p className="text-xs text-slate-400">Completed payments and downloadable tax receipts will be listed here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((txn) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                          {txn.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{txn.txnId}</span>
                      </div>
                      <h4 className="font-display font-black text-base text-slate-900 dark:text-white pt-0.5">
                        {txn.title}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                        Paid via {txn.paymentMode} • {txn.paidDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        Amount Paid
                      </span>
                      <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{txn.amount.toLocaleString()}
                      </strong>
                    </div>

                    <button
                      onClick={() => handleDownloadReceiptPDF(txn)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5"
                      title="Download Official Tax Receipt PDF"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span>Receipt PDF</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN ADD NEW FEE DUE MODAL */}
      <AnimatePresence>
        {isAddDueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-xs text-left relative"
            >
              <button
                onClick={() => setIsAddDueModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                    Post New Fee Due (Admin Panel)
                  </h3>
                  <p className="text-[11px] text-slate-400">Fees posted here instantly reflect on the Student Portal.</p>
                </div>
              </div>

              <form onSubmit={handleAdminCreateDue} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fee / Due Title *:</label>
                  <input
                    type="text"
                    placeholder="e.g. Semester 7 Academic Tuition & Lab Fee"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Category *:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                    >
                      <option value="Semester Tuition">Semester Tuition</option>
                      <option value="End Sem Exam">End Sem Exam</option>
                      <option value="Hostel & Mess">Hostel & Mess</option>
                      <option value="Transport & Parking">Transport & Parking</option>
                      <option value="Events & Fests">Events & Fests</option>
                      <option value="Fines & Dues">Fines & Dues</option>
                      <option value="Canteen & Dining">Canteen & Dining</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *:</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold text-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date *:</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Period:</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025-2026 (Sem 7)"
                      value={newAcademicYear}
                      onChange={(e) => setNewAcademicYear(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description:</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about fee breakdown, instructions..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Post Fee Due to Student Portal</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTI-OPTION PAYMENT CHECKOUT MODAL */}
      <AnimatePresence>
        {activeCheckoutItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-6 relative overflow-hidden text-xs text-left"
            >
              <button
                onClick={() => setActiveCheckoutItem(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                    NEXUS Campus Payment Gateway
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">Encrypted Financial Checkout Engine</span>
                </div>
              </div>

              {/* Item Details Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase">
                  {activeCheckoutItem.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{activeCheckoutItem.title}</h4>
                <p className="text-xs text-slate-500">{activeCheckoutItem.description}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-mono">
                  <span className="text-xs text-slate-400 font-sans font-bold">Total Amount Payable:</span>
                  <strong className="text-xl font-black text-indigo-600">
                    ₹{activeCheckoutItem.amount.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Select Payment Method:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMode('Razorpay UPI')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                      paymentMode === 'Razorpay UPI'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 shrink-0" />
                    <div>
                      <p>Razorpay UPI</p>
                      <span className="text-[9px] opacity-80 block font-normal">GPay / PhonePe / Paytm</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMode('NetBanking')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                      paymentMode === 'NetBanking'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div>
                      <p>Net Banking</p>
                      <span className="text-[9px] opacity-80 block font-normal">SBI, HDFC, ICICI, Axis</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMode('Credit/Debit Card')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                      paymentMode === 'Credit/Debit Card'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <div>
                      <p>Cards</p>
                      <span className="text-[9px] opacity-80 block font-normal">Visa / Mastercard / RuPay</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMode('Pay at Counter')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 ${
                      paymentMode === 'Pay at Counter'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Coins className="w-4 h-4 shrink-0" />
                    <div>
                      <p>Pay at Counter</p>
                      <span className="text-[9px] opacity-80 block font-normal">Cash / POS Desk</span>
                    </div>
                  </button>
                </div>

                {/* Sub-inputs */}
                {paymentMode === 'Razorpay UPI' && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                    <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300">VPA / UPI ID:</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. student@okicici"
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs font-mono"
                    />
                  </div>
                )}

                {paymentMode === 'NetBanking' && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                    <label className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Select Bank:</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                    >
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="PNB">Punjab National Bank (PNB)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Confirm & Pay ₹{activeCheckoutItem.amount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
