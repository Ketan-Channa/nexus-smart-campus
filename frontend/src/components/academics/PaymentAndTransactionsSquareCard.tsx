import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
} from 'lucide-react';
import { type FeeOrTransactionItem } from './PaymentAndTransactions';

interface PaymentAndTransactionsSquareCardProps {
  onNavigateToPayments?: () => void;
}

const DEFAULT_REMINDER_SLIDES = [
  {
    id: 'pay-1',
    title: 'Semester 7 Academic Tuition Fee',
    amount: '₹45,000',
    subtitle: 'Due Date: Aug 15, 2026',
    status: 'Pending Due',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    category: 'Semester Tuition',
  },
  {
    id: 'pay-2',
    title: 'End Semester Exam Fee',
    amount: '₹1,500',
    subtitle: 'Due Date: Aug 20, 2026',
    status: 'Pending Due',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    category: 'End Sem Exam',
  },
  {
    id: 'pay-3',
    title: 'Campus Bus Pass Renewal (Route #14)',
    amount: '₹4,200',
    subtitle: 'Due Date: Aug 18, 2026',
    status: 'Pending Due',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    category: 'Transport & Parking',
  },
  {
    id: 'pay-4',
    title: 'Nexus Food Court Meal Order',
    amount: '₹180.00',
    subtitle: 'Paid via Campus Pay Wallet',
    status: 'Paid Transaction',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    category: 'Canteen & Dining',
  },
];

export const PaymentAndTransactionsSquareCard: React.FC<PaymentAndTransactionsSquareCardProps> = ({
  onNavigateToPayments,
}) => {
  const [latestTxn, setLatestTxn] = useState<FeeOrTransactionItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const loadLatestPayment = () => {
    try {
      const raw = localStorage.getItem('nexus_completed_transactions');
      if (raw) {
        const parsed: FeeOrTransactionItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLatestTxn(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load latest payment for square card:', e);
    }
  };

  useEffect(() => {
    loadLatestPayment();
    const handleUpdate = () => loadLatestPayment();
    window.addEventListener('nexus_payment_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nexus_payment_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const slidesList = [
    ...(latestTxn
      ? [
          {
            id: 'live-txn-spotlight',
            title: latestTxn.title,
            amount: `₹${latestTxn.amount.toLocaleString()}`,
            subtitle: `Paid on ${latestTxn.paidDate || 'Today'} via ${latestTxn.paymentMode || 'App'}`,
            status: 'Latest Transaction',
            badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            category: latestTxn.category,
          },
        ]
      : []),
    ...DEFAULT_REMINDER_SLIDES,
  ];

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay || slidesList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, slidesList.length, currentIndex]);

  const currentSlide = slidesList[currentIndex] || slidesList[0];

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500 to-indigo-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Payment & Dues
            </h4>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-bold block">
              Razorpay & Wallet Billing
            </span>
          </div>
        </div>

        {/* Auto-Play Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoPlay(!isAutoPlay);
          }}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          title={isAutoPlay ? 'Pause Auto-Play' : 'Play Auto-Play'}
        >
          {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ROTATING CONTENT SLIDE BODY */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id + currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
          >
            {/* Top Category Badge */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-extrabold border border-violet-200 dark:border-violet-800/60">
                {currentSlide.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.status}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                {currentSlide.subtitle}
              </span>
            </div>

            {/* Amount Footer Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Transaction Amount</span>
              <strong className="text-base font-mono font-black text-violet-600 dark:text-violet-400">
                {currentSlide.amount}
              </strong>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 10-SECOND ANIMATED LOADING PROGRESS BAR */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToPayments) onNavigateToPayments();
          }}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
        >
          <span>Open Payment & Transactions</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + slidesList.length) % slidesList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Reminder"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % slidesList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Reminder"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
