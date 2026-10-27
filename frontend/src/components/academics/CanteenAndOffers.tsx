import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Search,
  Tag,
  ShoppingBag,
  Clock,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  QrCode,
  Flame,
  X,
  Printer,
  CreditCard,
  Building2,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { type UserSession } from '../../types/auth';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  outletName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  prepTime: string;
  calories: string;
  isVeg: boolean;
  isBestseller?: boolean;
  image: string;
  description: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface SpecialOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  minOrder: number;
  badge: string;
  bgGradient: string;
}

const CANTEEN_OUTLETS = [
  { id: 'all', name: 'All Campus Outlets', location: 'Entire Campus', time: '7:30 AM - 11:00 PM' },
  { id: 'central', name: 'Nexus Central Food Court', location: 'North Wing, Main Building', time: '8:00 AM - 10:00 PM' },
  { id: 'techcafe', name: 'Tech Cafe & Brews', location: 'CSE Block, Ground Floor', time: '7:30 AM - 11:00 PM' },
  { id: 'greenbyte', name: 'Green Byte Salad & Juice Bar', location: 'Sports Complex Wing', time: '9:00 AM - 8:00 PM' },
  { id: 'nightkiosk', name: 'Maggi & Night Crave Kiosk', location: 'Hostel Block B Entrance', time: '6:00 PM - 2:00 AM' },
];

const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'off-1',
    code: 'EXAM20',
    title: '20% OFF Exam Boost',
    description: 'Get 20% discount on all food & beverage orders above ₹150.',
    discountPercent: 20,
    minOrder: 150,
    badge: 'POPULAR OFFER',
    bgGradient: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'off-2',
    code: 'BREWFREE',
    title: 'Free Cold Coffee Bundle',
    description: 'Order any 2 Paninis/Burgers and get 1 Iced Mocha Latte Free!',
    discountPercent: 15,
    minOrder: 180,
    badge: 'COMBO SPECIAL',
    bgGradient: 'from-amber-600 to-rose-600',
  },
  {
    id: 'off-3',
    code: 'DELISH99',
    title: 'Desi Super Combo @ ₹99',
    description: 'Chole Bhature + Kulhad Masala Lassi Combo special rate.',
    discountPercent: 25,
    minOrder: 120,
    badge: 'MEAL OF THE DAY',
    bgGradient: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'off-4',
    code: 'NIGHT25',
    title: '25% OFF Night Crave Pass',
    description: 'Valid on late-night orders placed between 9:00 PM to 2:00 AM.',
    discountPercent: 25,
    minOrder: 100,
    badge: 'LATE NIGHT SPECIAL',
    bgGradient: 'from-rose-600 to-purple-600',
  },
];

const FOOD_MENU: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Paneer Tikka Grilled Sandwich',
    category: 'Fast Food & Snacks',
    outletName: 'Tech Cafe & Brews',
    price: 95,
    originalPrice: 120,
    rating: 4.8,
    prepTime: '10-12 mins',
    calories: '320 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    description: 'Spiced marinated paneer cubes, mint chutney, melted cheese grilled to crispy perfection.',
  },
  {
    id: 'food-2',
    name: 'Butter Masala Dosa + Sambhar',
    category: 'South & North Indian',
    outletName: 'Nexus Central Food Court',
    price: 85,
    originalPrice: 100,
    rating: 4.9,
    prepTime: '12-15 mins',
    calories: '280 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    description: 'Golden crispy dosa stuffed with spiced potato masala, served with hot sambhar & coconut chutney.',
  },
  {
    id: 'food-3',
    name: 'Double Cheese Veggie Burger',
    category: 'Fast Food & Snacks',
    outletName: 'Tech Cafe & Brews',
    price: 99,
    originalPrice: 130,
    rating: 4.7,
    prepTime: '10 mins',
    calories: '410 kcal',
    isVeg: true,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy veggie patty loaded with double cheddar cheese, lettuce, tomatoes, and spicy mayo.',
  },
  {
    id: 'food-4',
    name: 'Cold Coffee with Vanilla Scoop',
    category: 'Hot & Cold Beverages',
    outletName: 'Tech Cafe & Brews',
    price: 75,
    originalPrice: 90,
    rating: 4.9,
    prepTime: '5 mins',
    calories: '210 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    description: 'Rich blended espresso cold coffee topped with thick vanilla ice cream scoop & chocolate drizzle.',
  },
  {
    id: 'food-5',
    name: 'Chole Bhature + Masala Lassi',
    category: 'Combos & Meal Deals',
    outletName: 'Nexus Central Food Court',
    price: 110,
    originalPrice: 140,
    rating: 4.8,
    prepTime: '15 mins',
    calories: '520 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    description: 'Authentic Amritsari spicy chole paired with 2 fluffy bhatures and chilled sweet kulhad lassi.',
  },
  {
    id: 'food-6',
    name: 'Cheese Garlic Maggi Bowl',
    category: 'Fast Food & Snacks',
    outletName: 'Maggi & Night Crave Kiosk',
    price: 55,
    originalPrice: 70,
    rating: 4.7,
    prepTime: '7 mins',
    calories: '260 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&auto=format&fit=crop&q=80',
    description: 'Signature campus maggi cooked with extra butter, roasted garlic, oregano, and shredded mozzarella.',
  },
  {
    id: 'food-7',
    name: 'Fresh Avocado Protein Bowl',
    category: 'Healthy Salads & Bowls',
    outletName: 'Green Byte Salad & Juice Bar',
    price: 140,
    originalPrice: 170,
    rating: 4.6,
    prepTime: '8 mins',
    calories: '290 kcal',
    isVeg: true,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh sliced avocado, quinoa, edamame, cherry tomatoes, and olive oil lemon dressing.',
  },
  {
    id: 'food-8',
    name: 'Chocolate Lava Brownie Fudge',
    category: 'Desserts & Sweets',
    outletName: 'Tech Cafe & Brews',
    price: 80,
    originalPrice: 100,
    rating: 4.9,
    prepTime: '5 mins',
    calories: '340 kcal',
    isVeg: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    description: 'Warm gooey molten chocolate cake served with hot fudge sauce and chocolate sprinkles.',
  },
  {
    id: 'food-9',
    name: 'Peri Peri Crispy French Fries',
    category: 'Fast Food & Snacks',
    outletName: 'Tech Cafe & Brews',
    price: 70,
    originalPrice: 90,
    rating: 4.6,
    prepTime: '8 mins',
    calories: '310 kcal',
    isVeg: true,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
    description: 'Golden fried potato fries tossed in fiery African peri-peri spice blend served with mayo dip.',
  },
];

interface CanteenAndOffersProps {
  session?: UserSession | null;
}

export const CanteenAndOffers: React.FC<CanteenAndOffersProps> = ({ session }) => {
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState<SpecialOffer | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Selected Payment Option State
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<
    'upi' | 'netbanking' | 'card' | 'counter'
  >('upi');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [upiIdInput, setUpiIdInput] = useState('student@okicici');

  // Faculty Cabin Delivery State
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'cabin'>('pickup');
  const [cabinBuilding, setCabinBuilding] = useState('Faculty Block A');
  const [cabinDepartment, setCabinDepartment] = useState((session as any)?.department || 'Computer Science & Engineering');
  const [cabinNumber, setCabinNumber] = useState('Room 304');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Order Placement Modal State
  const [activeOrderToken, setActiveOrderToken] = useState<{
    tokenNo: string;
    pickupCounter: string;
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    estimatedTime: string;
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
    items: CartItem[];
    orderDate: string;
    orderTime: string;
  } | null>(null);

  // Categories list
  const categories = [
    'All Items',
    'Combos & Meal Deals',
    'Fast Food & Snacks',
    'Hot & Cold Beverages',
    'Healthy Salads & Bowls',
    'South & North Indian',
    'Desserts & Sweets',
  ];

  // Add item to cart
  const handleAddToCart = (food: FoodItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.food.id === food.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.food.id === food.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { food, quantity: 1 }];
    });
  };

  // Remove / Decrement item quantity
  const handleUpdateQuantity = (foodId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.food.id === foodId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Apply Coupon Code
  const handleApplyCoupon = (offer: SpecialOffer) => {
    const subtotalCalc = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
    if (subtotalCalc < offer.minOrder) {
      setPromoError(`Minimum order amount of ₹${offer.minOrder} required for code ${offer.code}.`);
      return;
    }
    setAppliedPromo(offer);
    setPromoError('');
  };

  const handleApplyCouponInput = (e: React.FormEvent) => {
    e.preventDefault();
    const codeUpper = promoInput.trim().toUpperCase();
    const offer = SPECIAL_OFFERS.find((o) => o.code === codeUpper);
    if (offer) {
      handleApplyCoupon(offer);
    } else {
      setPromoError('Invalid Coupon Code. Try EXAM20 or BREWFREE!');
    }
  };

  // Calculate Order Costs
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const discountAmount = appliedPromo
    ? Math.round((subtotal * appliedPromo.discountPercent) / 100)
    : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Order & Generate Live Token with Full Transaction Details
  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;

    let fullPaymentMethodName = 'UPI / GPay / PhonePe';
    let txnStatus = 'Paid Online (Verified)';
    const generatedTxnId = `TXN-NEX-${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (selectedPaymentMode === 'upi') {
      fullPaymentMethodName = `UPI Transfer (${upiIdInput || 'GPay/PhonePe'})`;
      txnStatus = 'UPI Real-Time Settled';
    } else if (selectedPaymentMode === 'netbanking') {
      fullPaymentMethodName = `Net Banking (${selectedBank})`;
      txnStatus = 'NetBanking Direct Settled';
    } else if (selectedPaymentMode === 'card') {
      fullPaymentMethodName = 'Debit / Credit Card (Visa/Mastercard/RuPay)';
      txnStatus = 'Card Authorized & Paid';
    } else if (selectedPaymentMode === 'counter') {
      fullPaymentMethodName = 'Pay at Counter (Cash / POS Card at Pick-Up)';
      txnStatus = 'Pending Counter Settlement';
    }

    const tokenNum = `TOKEN #T-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const orderDateStr = now.toISOString().substring(0, 10);
    const orderTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const destinationText =
      deliveryType === 'cabin'
        ? `Faculty Cabin: ${cabinBuilding}, Dept: ${cabinDepartment}, ${cabinNumber}`
        : 'Express Pick-Up Counter #1 (North Wing)';
    const estTime = deliveryType === 'cabin' ? '15-20 mins (Express Cabin Delivery)' : '10-12 mins';

    const orderPayload = {
      tokenNo: tokenNum,
      pickupCounter: destinationText,
      subtotal,
      discountAmount,
      totalAmount: grandTotal,
      estimatedTime: estTime,
      paymentMethod: fullPaymentMethodName,
      transactionId: generatedTxnId,
      paymentStatus: txnStatus,
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      firstItemName: cart[0]?.food.name || 'Canteen Delights',
      orderDate: orderDateStr,
      orderTime: orderTimeStr,
      status: deliveryType === 'cabin' ? 'Kitchen Preparing (Cabin Dispatch)' : 'Kitchen Preparing',
      deliveryType,
      cabinBuilding: deliveryType === 'cabin' ? cabinBuilding : null,
      cabinDepartment: deliveryType === 'cabin' ? cabinDepartment : null,
      cabinNumber: deliveryType === 'cabin' ? cabinNumber : null,
      deliveryNotes: deliveryType === 'cabin' ? deliveryNotes : null,
    };

    try {
      localStorage.setItem('nexus_canteen_latest_order', JSON.stringify(orderPayload));
      window.dispatchEvent(new Event('nexus_canteen_order_updated'));
    } catch (e) {
      console.error('Error saving latest canteen order:', e);
    }

    setActiveOrderToken({
      tokenNo: tokenNum,
      pickupCounter: destinationText,
      subtotal,
      discountAmount,
      totalAmount: grandTotal,
      estimatedTime: estTime,
      paymentMethod: fullPaymentMethodName,
      transactionId: generatedTxnId,
      paymentStatus: txnStatus,
      items: [...cart],
      orderDate: orderDateStr,
      orderTime: orderTimeStr,
    });

    setCart([]);
    setAppliedPromo(null);
    setIsCartOpen(false);
  };

  // GENERATE & PRINT FOOD BILL PDF (UPDATED WITH FULL TRANSACTION DETAILS)
  const handlePrintFoodBillPDF = () => {
    if (!activeOrderToken) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('NEXUS CAMPUS CENTRAL FOOD COURT', 74, 7, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('TAX INVOICE & OFFICIAL TRANSACTION RECEIPT', 74, 13, { align: 'center' });

      // Token & Transaction Badge Box
      doc.setFillColor(225, 29, 72);
      doc.rect(10, 22, 128, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(activeOrderToken.tokenNo, 74, 28, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ref Txn ID: ${activeOrderToken.transactionId}`, 74, 33, { align: 'center' });

      // Customer Details & Transaction Info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Customer Name: ${session?.name || 'Ketan Channa'} (2023CSE4091)`, 10, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date & Time: ${activeOrderToken.orderDate} | ${activeOrderToken.orderTime}`, 10, 47);
      doc.text(`Counter Location: ${activeOrderToken.pickupCounter}`, 10, 52);
      doc.text(`Payment Mode: ${activeOrderToken.paymentMethod}`, 10, 57);
      doc.text(`Transaction Status: ${activeOrderToken.paymentStatus}`, 10, 62);

      // Items Table Header
      doc.setDrawColor(203, 213, 225);
      doc.line(10, 66, 138, 66);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Item Description', 10, 70);
      doc.text('Qty', 85, 70);
      doc.text('Price', 105, 70);
      doc.text('Total', 125, 70);
      doc.line(10, 73, 138, 73);

      // Itemized Table Rows
      let y = 78;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      activeOrderToken.items.forEach((item) => {
        doc.text(item.food.name.substring(0, 32), 10, y);
        doc.text(`${item.quantity}`, 87, y);
        doc.text(`Rs.${item.food.price}`, 105, y);
        doc.text(`Rs.${item.food.price * item.quantity}`, 125, y);
        y += 6;
      });

      doc.line(10, y, 138, y);
      y += 5;

      // Bill Summary & Totals
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal Amount:`, 75, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs.${activeOrderToken.subtotal}`, 125, y);
      y += 5;

      if (activeOrderToken.discountAmount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(225, 29, 72);
        doc.text(`Coupon Discount:`, 75, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`-Rs.${activeOrderToken.discountAmount}`, 125, y);
        y += 5;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Campus Subsidized GST (0%):`, 75, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs.0`, 125, y);
      y += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total Amount:`, 75, y);
      doc.text(`Rs.${activeOrderToken.totalAmount}`, 125, y);

      // Transaction Verification Footer
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 185, 138, 185);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Verified Digitally by NEXUS Campus Pay Gateway | Ref: ${activeOrderToken.transactionId}`, 74, 190, { align: 'center' });

      // Bottom Footer Bar
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 195, 148, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('THANK YOU FOR ORDERING WITH NEXUS CANTEEN PAY!', 74, 202, { align: 'center' });

      doc.save(`nexus_canteen_bill_${activeOrderToken.tokenNo.replace('#', '').replace(' ', '_')}.pdf`);
    } catch (err) {
      alert('Error printing Food Bill PDF.');
    }
  };

  // Filtered Food Menu
  const filteredMenu = FOOD_MENU.filter((item) => {
    const matchesOutlet = selectedOutlet === 'all' || item.outletName.toLowerCase().includes(selectedOutlet);
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outletName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesOutlet && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER & LIVE WALLET STATUS */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            NEXUS Campus Canteen & Special Offers Portal
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Order Food Online & Exclusive Campus Deals
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 opacity-90 leading-relaxed">
            Skip long canteen queues, apply discount coupons, download itemized transaction invoices, and pick up your meal with live express tokens!
          </p>
        </div>

        {/* Cart Counter Button */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white text-rose-900 font-black text-xs shadow-xl hover:bg-amber-50 transition-all flex items-center gap-2 relative"
          >
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            <span>My Cart ({totalCartCount})</span>
            {totalCartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold ml-1">
                ₹{grandTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SPECIAL OFFERS & DISCOUNT COUPONS ROTATOR GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-rose-500" />
            Today's Exclusive Canteen Offers & Coupons
          </h3>
          <span className="text-xs text-rose-500 font-bold">Apply at checkout!</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPECIAL_OFFERS.map((offer) => {
            const isApplied = appliedPromo?.id === offer.id;
            return (
              <motion.div
                key={offer.id}
                whileHover={{ scale: 1.02 }}
                className={`rounded-3xl p-5 bg-gradient-to-br ${offer.bgGradient} text-white shadow-lg space-y-3 relative overflow-hidden flex flex-col justify-between`}
              >
                <div className="space-y-1 z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-wider">
                      {offer.badge}
                    </span>
                    <span className="font-mono text-xs font-black px-2 py-1 rounded-xl bg-white text-slate-900">
                      {offer.code}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-base pt-1">{offer.title}</h4>
                  <p className="text-[11px] text-white/90 leading-snug">{offer.description}</p>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold opacity-80">Min Order: ₹{offer.minOrder}</span>
                  <button
                    onClick={() => {
                      handleApplyCoupon(offer);
                      setIsCartOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isApplied
                        ? 'bg-emerald-400 text-slate-950 shadow-md'
                        : 'bg-white/20 hover:bg-white text-white hover:text-slate-950'
                    }`}
                  >
                    {isApplied ? 'Applied ✓' : 'Use Coupon'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CANTEEN OUTLETS SELECTION & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food items (Paneer Sandwich, Dosa, Cold Coffee, Maggi...)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>

          {/* Outlets Select Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {CANTEEN_OUTLETS.map((outlet) => (
              <button
                key={outlet.id}
                onClick={() => setSelectedOutlet(outlet.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedOutlet === outlet.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{outlet.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FOOD ITEMS CATALOG GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((food) => {
          const cartEntry = cart.find((ci) => ci.food.id === food.id);
          const qty = cartEntry ? cartEntry.quantity : 0;

          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Dietary Veg Icon & Bestseller Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-emerald-600 flex items-center justify-center p-0.5 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  </span>
                  {food.isBestseller && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                      BESTSELLER
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-300 text-xs font-black flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{food.rating}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    {food.outletName}
                  </span>
                  <h4 className="font-display font-black text-base leading-snug line-clamp-1">{food.name}</h4>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {food.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{food.prepTime}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{food.calories}</span>
                  </span>
                </div>

                {/* Price & Add to Cart Counter */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-lg text-slate-900 dark:text-white">
                      ₹{food.price}
                    </span>
                    {food.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">₹{food.originalPrice}</span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(food)}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-black text-xs shadow-md hover:from-rose-500 hover:to-purple-500 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-2xl border border-rose-200 dark:border-rose-800">
                      <button
                        onClick={() => handleUpdateQuantity(food.id, -1)}
                        className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 text-rose-600 font-bold flex items-center justify-center shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-xs px-2 text-rose-600 dark:text-rose-400">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(food.id, 1)}
                        className="w-7 h-7 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SHOPPING CART & MULTI-PAYMENT CHECKOUT DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 overflow-y-auto text-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-rose-600" />
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                      Your Canteen Order Cart ({totalCartCount})
                    </h3>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items List */}
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3 text-slate-400">
                    <Utensils className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold">Your Canteen Cart is empty.</p>
                    <p className="text-[11px] text-slate-400">Add delicious sandwiches, dosa, brews & combos to order!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.food.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img src={item.food.image} alt={item.food.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.food.name}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">₹{item.food.price} each</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.food.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.food.id, 1)}
                            className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Promo Code Coupon Input */}
                <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Have a Campus Coupon Code?</label>
                  <form onSubmit={handleApplyCouponInput} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter EXAM20, BREWFREE..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none"
                    />
                    <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs">
                      Apply
                    </button>
                  </form>
                  {promoError && <p className="text-[10px] text-rose-500 font-bold">{promoError}</p>}
                  {appliedPromo && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                      <span>Applied: {appliedPromo.code} ({appliedPromo.discountPercent}% OFF)</span>
                      <button onClick={() => setAppliedPromo(null)} className="text-slate-400 hover:text-rose-500 font-bold">✕</button>
                    </div>
                  )}
                </div>

                {/* FACULTY CABIN DELIVERY / COUNTER PICK-UP SELECTOR */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Select Delivery Destination:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all text-xs ${
                        deliveryType === 'pickup'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">Canteen Counter</div>
                      <span className="text-[10px] opacity-80 block font-normal">Self Pick-up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('cabin')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all text-xs ${
                        deliveryType === 'cabin'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-400/30'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">Faculty Cabin Delivery</div>
                      <span className="text-[10px] opacity-80 block font-normal">Direct to Office</span>
                    </button>
                  </div>

                  {deliveryType === 'cabin' && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase tracking-wider">
                        Office / Cabin Destination Details
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Building / Block:</label>
                          <select
                            value={cabinBuilding}
                            onChange={(e) => setCabinBuilding(e.target.value)}
                            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                          >
                            <option value="Faculty Block A">Faculty Block A</option>
                            <option value="Tech Tower B">Tech Tower B</option>
                            <option value="Main Academic Block">Main Academic Block</option>
                            <option value="Science Block C">Science Block C</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Cabin / Room #:</label>
                          <input
                            type="text"
                            value={cabinNumber}
                            onChange={(e) => setCabinNumber(e.target.value)}
                            placeholder="Room 304"
                            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Delivery Instructions (Optional):</label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="e.g. Leave on desk if in lecture session"
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* MULTIPLE PAYMENT METHOD SELECTOR */}
                {cart.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                      <span>Select Payment Gateway Mode *:</span>
                      <span className="text-[10px] text-indigo-500 font-mono">100% Encrypted</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('upi')}
                        className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                          selectedPaymentMode === 'upi'
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-purple-300 shrink-0" />
                        <div>
                          <p className="leading-tight">UPI / QR Code</p>
                          <span className="text-[9px] opacity-80 block font-normal">GPay / PhonePe / Paytm</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('netbanking')}
                        className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                          selectedPaymentMode === 'netbanking'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-indigo-300 shrink-0" />
                        <div>
                          <p className="leading-tight">Net Banking</p>
                          <span className="text-[9px] opacity-80 block font-normal">SBI, HDFC, ICICI, Axis</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('card')}
                        className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                          selectedPaymentMode === 'card'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-300 shrink-0" />
                        <div>
                          <p className="leading-tight">Debit / Card</p>
                          <span className="text-[9px] opacity-80 block font-normal">Visa / Mastercard / RuPay</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('counter')}
                        className={`col-span-2 p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                          selectedPaymentMode === 'counter'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Coins className="w-4 h-4 text-emerald-300 shrink-0" />
                        <div>
                          <p className="leading-tight">Pay at Counter (Cash / POS Card)</p>
                          <span className="text-[9px] opacity-80 block font-normal">Pay physically at Express Counter #1 upon order pick-up</span>
                        </div>
                      </button>
                    </div>

                    {/* PAYMENT SUB-FIELDS */}
                    {selectedPaymentMode === 'upi' && (
                      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                        <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300">VPA / UPI ID:</label>
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. 9876543210@paytm or student@okicici"
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs font-mono"
                        />
                      </div>
                    )}

                    {selectedPaymentMode === 'netbanking' && (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                        <label className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Select Bank:</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                        >
                          <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown & Checkout Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span className="font-mono font-bold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Grand Total</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIRM & PLACE ORDER NOW (₹{grandTotal})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE CANTEEN TOKEN ORDER CONFIRMATION & PRINT BILL MODAL */}
      <AnimatePresence>
        {activeOrderToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOrderToken(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center text-xs"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-400/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black border border-rose-300">
                  ORDER CONFIRMED & KITCHEN NOTIFIED
                </span>
                <h3 className="font-display font-black text-3xl text-slate-900 dark:text-white pt-2 font-mono">
                  {activeOrderToken.tokenNo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Show this token number at the express pick-up counter when ready!
                </p>
              </div>

              {/* Order Status & Full Transaction Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-slate-500">Txn Ref ID:</span>
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">{activeOrderToken.transactionId}</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-slate-500">Pick-Up Counter:</span>
                  <strong className="text-slate-900 dark:text-white">{activeOrderToken.pickupCounter}</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-slate-500">Est. Prep Time:</span>
                  <strong className="text-rose-500 font-bold">{activeOrderToken.estimatedTime}</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-slate-500">Payment Gateway Mode:</span>
                  <strong className="text-purple-600 dark:text-purple-400">{activeOrderToken.paymentMethod}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Status:</span>
                  <strong className="text-emerald-500 font-bold">{activeOrderToken.paymentStatus}</strong>
                </div>
              </div>

              {/* PRINT FOOD BILL PDF BUTTON WITH FULL TXN DETAILS */}
              <button
                onClick={handlePrintFoodBillPDF}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Tax Invoice (PDF)</span>
              </button>

              <button
                onClick={() => setActiveOrderToken(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all"
              >
                Done & Return to Canteen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
