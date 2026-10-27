import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Tag,
  Clock,
} from 'lucide-react';

interface CanteenAndOffersSquareCardProps {
  onNavigateToCanteen?: () => void;
}

export interface LatestCanteenOrder {
  tokenNo: string;
  pickupCounter: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  estimatedTime: string;
  paymentMethod: string;
  itemCount: number;
  firstItemName: string;
  orderDate: string;
  orderTime: string;
  status: string;
}

const STATIC_PROMO_SLIDES = [
  {
    type: 'promo',
    id: 'promo-1',
    code: 'EXAM20',
    title: '20% OFF Exam Boost Coupon',
    description: 'Get 20% discount on all food & beverages above ₹150.',
    badge: 'POPULAR OFFER',
    tagColor: 'from-purple-600 to-indigo-600',
    priceText: 'Save 20%',
  },
  {
    type: 'promo',
    id: 'promo-2',
    code: 'DELISH99',
    title: 'Chole Bhature Combo @ ₹99',
    description: 'Authentic Chole Bhature + Sweet Kulhad Masala Lassi.',
    badge: 'MEAL OF THE DAY',
    tagColor: 'from-emerald-600 to-teal-600',
    priceText: '₹99 Only',
  },
  {
    type: 'promo',
    id: 'promo-3',
    code: 'BREWFREE',
    title: 'Free Cold Coffee Bundle',
    description: 'Order 2 Grilled Paninis and get 1 Iced Mocha Free.',
    badge: 'COMBO SPECIAL',
    tagColor: 'from-amber-600 to-rose-600',
    priceText: 'Free Beverage',
  },
  {
    type: 'promo',
    id: 'promo-4',
    code: 'NIGHT25',
    title: '25% OFF Night Crave Pass',
    description: 'Valid past 9:00 PM on Maggi & late-night snacks.',
    badge: 'LATE NIGHT SPECIAL',
    tagColor: 'from-rose-600 to-purple-600',
    priceText: '25% OFF',
  },
];

export const CanteenAndOffersSquareCard: React.FC<CanteenAndOffersSquareCardProps> = ({
  onNavigateToCanteen,
}) => {
  const [latestOrder, setLatestOrder] = useState<LatestCanteenOrder | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Fetch latest order from localStorage & subscribe to live updates
  const loadLatestOrder = () => {
    try {
      const raw = localStorage.getItem('nexus_canteen_latest_order');
      if (raw) {
        setLatestOrder(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to parse latest canteen order:', e);
    }
  };

  useEffect(() => {
    loadLatestOrder();
    const handleOrderUpdate = () => loadLatestOrder();
    window.addEventListener('nexus_canteen_order_updated', handleOrderUpdate);
    window.addEventListener('storage', handleOrderUpdate);

    return () => {
      window.removeEventListener('nexus_canteen_order_updated', handleOrderUpdate);
      window.removeEventListener('storage', handleOrderUpdate);
    };
  }, []);

  // Combine Active Order (if present) + Promo Slides
  const slidesList = [
    ...(latestOrder
      ? [
          {
            type: 'order',
            id: 'active-order',
            tokenNo: latestOrder.tokenNo,
            title: `Active Order ${latestOrder.tokenNo}`,
            description: `${latestOrder.itemCount} Items (${latestOrder.firstItemName})`,
            badge: latestOrder.status.toUpperCase(),
            tagColor: 'from-amber-500 via-rose-600 to-purple-600',
            priceText: `₹${latestOrder.totalAmount}`,
            estTime: latestOrder.estimatedTime,
            counter: latestOrder.pickupCounter,
          },
        ]
      : []),
    ...STATIC_PROMO_SLIDES,
  ];

  // Auto-play interval effect (10 seconds)
  useEffect(() => {
    if (!isAutoPlay || slidesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesList.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlay, slidesList.length, currentIndex]);

  const currentSlide = slidesList[currentIndex] || slidesList[0];
  const isOrderSlide = currentSlide.type === 'order';

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Background Ambient Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-rose-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Canteen & Offers
            </h4>
            <span className="text-xs text-slate-400 font-bold block">
              Campus Food Court & Deals
            </span>
          </div>
        </div>

        {/* Auto-Play Toggle Button */}
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
            className={`p-4 rounded-2xl border shadow-inner flex flex-col justify-between h-full space-y-2 ${
              isOrderSlide
                ? 'bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 border-amber-300 dark:border-amber-700/60'
                : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            {/* Top Badge & Code / Token Row */}
            <div className="flex items-center justify-between text-[11px]">
              <span
                className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                  isOrderSlide
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                {currentSlide.badge}
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold text-[10px]">
                {isOrderSlide ? (currentSlide as any).tokenNo : `CODE: ${(currentSlide as any).code}`}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold line-clamp-1 mt-1">
                {currentSlide.description}
              </p>
            </div>

            {/* Bottom Status / Price Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {isOrderSlide ? (
                <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>Est: {(currentSlide as any).estTime}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  <Tag className="w-3 h-3 text-amber-500" />
                  <span>Exclusive Coupon</span>
                </div>
              )}

              <span className="px-2.5 py-0.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-black text-[10px]">
                {currentSlide.priceText}
              </span>
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
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION ARROWS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToCanteen) onNavigateToCanteen();
          }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>Open Canteen & Offers</span>
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
            title="Previous Slide"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % slidesList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Slide"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
