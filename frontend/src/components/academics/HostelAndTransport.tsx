import React, { useState } from 'react';
import {
  Home,
  Bus,
  Bike,
  Download,
  BookmarkCheck,
  LogOut,
  FileCheck,
  Paperclip,
  Utensils,
  Trophy,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin,
  XCircle,
  QrCode,
  Building2,
  Coins,
  X,
  Check,
  ShieldCheck,
  FileText,
  Upload,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { type UserSession } from '../../types/auth';

export interface BusRoute {
  id: string;
  routeNumber: string;
  pickupStand: string;
  destination: string;
  departureTime: string;
  driverName: string;
  driverPhone: string;
  busNumber: string;
  totalSeats: number;
  occupiedSeats: number;
  quarterlyFee: number;
}

export interface RoomDetails {
  roomNumber: string;
  block: string;
  capacity: 'Single' | 'Double' | 'Triple' | 'Quadruple' | 'Deluxe Suite';
  isAvailable: boolean;
  currentTenants: string[];
  notes: string;
}

const CAMPUS_ROOM_DATABASE: RoomDetails[] = [
  {
    roomNumber: 'C-201',
    block: 'Hostel Block C (Deluxe PG)',
    capacity: 'Deluxe Suite',
    isAvailable: true,
    currentTenants: ['Devansh Singh (MBA)'],
    notes: '1 Deluxe Single Bed Available with Attached Washroom & Mini Kitchen ✓',
  },
  {
    roomNumber: 'A-202',
    block: 'Hostel Block A (Girls)',
    capacity: 'Single',
    isAvailable: true,
    currentTenants: ['Priyanjali Sen (B.Tech CE)'],
    notes: 'Single Room Available for Female Residence ✓',
  },
  {
    roomNumber: 'B-304',
    block: 'Hostel Block B (Boys)',
    capacity: 'Triple',
    isAvailable: true,
    currentTenants: ['Aarav Sharma (CSE)', 'Rohan Verma (ECE)'],
    notes: 'Triple Room Bed Vacant ✓',
  },
  {
    roomNumber: 'A-104',
    block: 'Hostel Block A (Boys)',
    capacity: 'Double',
    isAvailable: true,
    currentTenants: ['Vikramaditya Rao (B.Tech CE)'],
    notes: '1 Bed Vacant in Double Sharing Room ✓',
  },
  {
    roomNumber: 'B-105',
    block: 'Hostel Block B (Boys)',
    capacity: 'Double',
    isAvailable: true,
    currentTenants: [],
    notes: 'Vacant Double Room Available for Immediate Allotment ✓',
  },
];

export interface WeeklyMealMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

const SAMPLE_WEEKLY_MENU: WeeklyMealMenu[] = [
  {
    day: 'Monday',
    breakfast: 'Aloo Paratha, Curd, Pickle, Tea / Coffee & Fresh Bananas',
    lunch: 'Dal Makhani, Shahi Paneer, Jeera Rice, Butter Roti & Salad',
    snacks: 'Samosa, Mint Chutney & Hot Masala Tea',
    dinner: 'Mix Veg, Chana Dal, Steamed Rice, Chapati & Gulab Jamun',
  },
  {
    day: 'Tuesday',
    breakfast: 'Idli Sambhar, Coconut Chutney, Masala Dosa & Hot Coffee',
    lunch: 'Rajma Masala, Aloo Gobi, Steamed Basmati Rice, Roti & Boondi Raita',
    snacks: 'Veg Sandwich, Tomato Ketchup & Ginger Tea',
    dinner: 'Kadhai Paneer, Yellow Dal Tadka, Veg Pulao, Chapati & Kheer',
  },
  {
    day: 'Wednesday',
    breakfast: 'Puri Bhaji, Suji Halwa, Tea / Coffee & Seasonal Fruit',
    lunch: 'Chole Bhature, Veg Biryani, Cucumber Raita & Green Salad',
    snacks: 'Bread Pakora, Green Chutney & Hot Tea',
    dinner: 'Paneer Butter Masala, Dal Fry, Jeera Rice, Butter Naan & Ice Cream',
  },
  {
    day: 'Thursday',
    breakfast: 'Veg Upma, Coconut Chutney, Boiled Eggs / Banana, Tea',
    lunch: 'Kadhi Pakoda, Aloo Capsicum, Steamed Rice, Chapati & Salad',
    snacks: 'Papdi Chaat / Sev Puri & Iced Lemon Tea',
    dinner: 'Matar Paneer, Mix Dal, Peas Pulao, Chapati & Rasgulla',
  },
  {
    day: 'Friday',
    breakfast: 'Poha with Peanuts, Sev, Jalebi, Tea / Coffee',
    lunch: 'Dal Makhani, Veg Kolhapuri, Veg Fried Rice, Roti & Mix Raita',
    snacks: 'Spring Roll, Schezwan Dip & Cardamom Tea',
    dinner: 'Paneer Do Pyaza, Moong Dal Tadka, Steamed Rice, Chapati & Gajar Halwa',
  },
  {
    day: 'Saturday',
    breakfast: 'Uttapam, Sambhar, Tomato Chutney, Tea / Coffee',
    lunch: 'Panchmel Dal, Bhindi Masala, Steamed Rice, Chapati & Curd',
    snacks: 'French Fries / Veg Cutlet & Hot Coffee',
    dinner: 'Special Veg Thali: Shahi Paneer, Dal Makhani, Veg Pulao, Butter Naan & Kulfi',
  },
  {
    day: 'Sunday',
    breakfast: 'Chole Kulche, Sweet Lassi / Coffee & Fruits',
    lunch: 'Special Sunday Feast: Paneer Tikka Masala, Veg Dum Biryani, Boondi Raita & Salad',
    snacks: 'Samosa Chaat & Hot Masala Tea',
    dinner: 'Light Khichdi / Veg Noodles, Manchurian, Soup & Custard',
  },
];

const SAMPLE_WEEKLY_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Hostel Premier League (HPL T20 Cricket Tournament)',
    day: 'Monday - Wednesday',
    date: '16th Aug - 18th Aug 2026',
    time: '05:00 PM - 08:00 PM',
    venue: 'Campus Main Floodlight Sports Ground',
    description: 'Inter-block T20 cricket championship featuring 8 hostel teams.',
  },
  {
    id: 'act-2',
    title: 'Late-Night Study Lounge & Board Games Evening',
    day: 'Friday',
    date: '21st Aug 2026',
    time: '09:00 PM - 01:00 AM',
    venue: 'Hostel Block B Central Lounge',
    description: 'Quiet study tables, hot coffee station, Chess, Carrom & Catan.',
  },
  {
    id: 'act-3',
    title: 'Mess Advisory Committee Food Review Meet',
    day: 'Saturday',
    date: '22nd Aug 2026',
    time: '06:00 PM - 07:30 PM',
    venue: 'Central Dining Hall Conference Suite',
    description: 'Monthly student feedback session with Chief Warden and Executive Chefs.',
  },
  {
    id: 'act-4',
    title: 'Sunday Open-Air Movie Night & Acoustic Jam',
    day: 'Sunday',
    date: '23rd Aug 2026',
    time: '08:00 PM - 10:30 PM',
    venue: 'Hostel Amphitheatre Quad',
    description: 'Live acoustic guitar performances followed by outdoor movie screening.',
  },
];

const SAMPLE_BUS_ROUTES: BusRoute[] = [
  {
    id: 'route-1',
    routeNumber: 'Bus Route #14',
    pickupStand: 'Sector 62 Metro Station & City Square',
    destination: 'Campus Main Gate & Hostel Quad',
    departureTime: '07:45 AM & 08:30 AM (Daily)',
    driverName: 'Mr. Surender Kumar',
    driverPhone: '+91 98765 44321',
    busNumber: 'DL-01-AB-4091',
    totalSeats: 45,
    occupiedSeats: 38,
    quarterlyFee: 4200,
  },
  {
    id: 'route-2',
    routeNumber: 'Bus Route #08',
    pickupStand: 'Connaught Place & Rajiv Chowk Stand',
    destination: 'Campus Main Gate',
    departureTime: '07:30 AM (Daily)',
    driverName: 'Mr. Rajesh Verma',
    driverPhone: '+91 98123 55678',
    busNumber: 'DL-01-XY-8812',
    totalSeats: 45,
    occupiedSeats: 42,
    quarterlyFee: 4800,
  },
  {
    id: 'route-3',
    routeNumber: 'Bus Route #22',
    pickupStand: 'Vaishali Metro & Kaushambi Gate',
    destination: 'Campus Academic Block & Hostel Gate',
    departureTime: '08:00 AM (Daily)',
    driverName: 'Mr. Vikram Singh',
    driverPhone: '+91 98765 88990',
    busNumber: 'DL-02-CS-9912',
    totalSeats: 45,
    occupiedSeats: 30,
    quarterlyFee: 4000,
  },
];

interface HostelAndTransportProps {
  session?: UserSession | null;
}

export const HostelAndTransport: React.FC<HostelAndTransportProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'hostel_forms' | 'weekly_menu' | 'hostel_activities' | 'transport_hub'>('hostel_forms');
  const [hostelSubTab, setHostelSubTab] = useState<'apply' | 'concern' | 'surrender'>('apply');
  const [transportSubTab, setTransportSubTab] = useState<'join_bus' | 'self_parking' | 'lost_pass' | 'leave_bus'>('join_bus');
  // Dynamic Student Credentials from Session
  const studentName = session?.name || 'Authorized Student';
  const rollNumber = session?.email || 'NEXUS-ID-VERIFIED';
  const [mobileNumber, setMobileNumber] = useState((session as any)?.phone || '+91 98765 43210');
  const [dateOfBirth, setDateOfBirth] = useState('2005-04-12');

  const [degree, setDegree] = useState<'B.Tech' | 'BBA' | 'B.Sc' | 'MBA' | 'M.Tech'>('B.Tech');
  const [joiningYear, setJoiningYear] = useState('2023');
  const [department, setDepartment] = useState<'Computer Science & Engineering' | 'Civil Engineering' | 'Mechanical Engineering' | 'Finance' | 'HR & Marketing'>('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 7');
  const [sectionCode, setSectionCode] = useState('Sec-4A');

  // 1. HOSTEL APPLY FORM STATE
  const [joiningDate, setJoiningDate] = useState('2026-08-15');
  const [messOption, setMessOption] = useState<'With Mess (Full 4-Meal Plan)' | 'Without Mess (Self Cooking / Canteen)'>('With Mess (Full 4-Meal Plan)');
  const [sharingBasis, setSharingBasis] = useState<'Single' | 'Double' | 'Triple' | 'Quadruple' | 'Deluxe Suite (Attached Washroom & Mini Kitchen)'>('Triple');
  const [targetBlock, setTargetBlock] = useState('Hostel Block B (Boys)');
  
  // Disability Option (HOSTEL)
  const [hasHostelDisabilityConcession, setHasHostelDisabilityConcession] = useState(false);
  const [hostelDisabilityCardNo, setHostelDisabilityCardNo] = useState('DIS-GOV-2024-9912');
  const [hostelDisabilityFile, setHostelDisabilityFile] = useState<File | null>(null);

  // Hostel Payment Mode State: 'online_upi' | 'online_netbanking' | 'accounts_office_cash'
  const [hostelPaymentMode, setHostelPaymentMode] = useState<'online_upi' | 'online_netbanking' | 'accounts_office_cash'>('online_upi');
  const [hostelPaymentStatus, setHostelPaymentStatus] = useState<'unpaid' | 'pending_admin_approval' | 'paid_online'>('unpaid');
  const [isHostelQrModalOpen, setIsHostelQrModalOpen] = useState(false);
  const [isProcessingHostelPayment, setIsProcessingHostelPayment] = useState(false);

  const calculateHostelBaseFee = () => {
    let base = messOption === 'With Mess (Full 4-Meal Plan)' ? 45000 : 30000;
    if (hasHostelDisabilityConcession) {
      return base * 0.5;
    }
    return base;
  };

  const calculateHostelTotalPayable = () => {
    const base = calculateHostelBaseFee();
    if (hostelPaymentMode === 'accounts_office_cash') {
      return base + 150; // Cash Handling Fee ₹150
    }
    return base;
  };

  // 2. ROOM CHANGE & VACATION & MAINTENANCE STATE WITH DATES & MEDIA FILE UPLOAD
  const [concernCategory, setConcernCategory] = useState<'Room Change Request' | 'Vacation Leave Pass' | 'Maintenance / Complaint'>('Room Change Request');
  const [targetRoomNumberInput, setTargetRoomNumberInput] = useState('C-201');
  const [concernReason, setConcernReason] = useState('Requesting Single/Deluxe Suite upgrade for quiet academic research environment.');
  
  // Vacation Dates & File Upload
  const [vacationStartDate, setVacationStartDate] = useState('2026-08-14');
  const [vacationEndDate, setVacationEndDate] = useState('2026-08-20');
  const [vacationReason, setVacationReason] = useState('Outstation home visit for family function and semester break.');
  const [parentApprovalFile, setParentApprovalFile] = useState<File | null>(null);

  // Maintenance Category, Dates & File Upload
  const [complaintCategory, setComplaintCategory] = useState<'Plumbing & Water' | 'Electrical & Lighting' | 'Furniture & Bed' | 'Cleanliness & Hygiene' | 'Wi-Fi & Internet' | 'AC & Ventilation'>('Plumbing & Water');
  const [incidentDate, setIncidentDate] = useState('2026-09-03');
  const [maintenanceLocation, setMaintenanceLocation] = useState('Room B-304 / Washroom Block B');
  const [maintenanceDescription, setMaintenanceDescription] = useState('Water leakage from main sink pipe causing floor dampness.');
  const [complaintEvidenceFile, setComplaintEvidenceFile] = useState<File | null>(null);

  const matchedTargetRoom = CAMPUS_ROOM_DATABASE.find(
    (r) => r.roomNumber.trim().toLowerCase() === targetRoomNumberInput.trim().toLowerCase()
  );

  // 3. COMPLETELY LEAVE HOSTEL MULTI-SIGNATURE WORKFLOW STATE
  const [vacatingDate, setVacatingDate] = useState('2026-08-31');
  const [surrenderReason, setSurrenderReason] = useState('Completing final semester & relocating off-campus.');
  const [refundBankAcc, setRefundBankAcc] = useState('987654321098 (HDFC Bank - IFSC: HDFC0001234)');
  const [signedInchargeApproval, setSignedInchargeApproval] = useState(true);
  const [signedHodApproval, setSignedHodApproval] = useState(true);
  const [signedWardenApproval, setSignedWardenApproval] = useState(true);
  const [signedAdminClearance, setSignedAdminClearance] = useState(true);
  const [signedNocFile, setSignedNocFile] = useState<File | null>(null);

  // 4. WEEKLY MENU STATE
  const [selectedMenuDay, setSelectedMenuDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Monday');

  // 5. COLLEGE BUS SERVICE APPLICATION FORM STATE (MORE COLUMNS + DISABILITY CONCESSION)
  const [selectedRouteId, setSelectedRouteId] = useState('route-1');
  const [pickupStandInput, setPickupStandInput] = useState('Sector 62 Metro Station Gate 2');
  const [transitShift, setTransitShift] = useState<'Morning 07:30 AM Shift' | 'Afternoon 02:30 PM Shift'>('Morning 07:30 AM Shift');
  
  // Disability Option for Bus Service
  const [hasBusDisabilityDiscount, setHasBusDisabilityDiscount] = useState(false);
  const [busDisabilityCardNo, setBusDisabilityCardNo] = useState('DIS-BUS-2024-8812');
  const [busDisabilityFile, setBusDisabilityFile] = useState<File | null>(null);

  // Bus Payment Mode State
  const [busPaymentMode, setBusPaymentMode] = useState<'online_upi' | 'online_netbanking' | 'accounts_office_cash'>('online_upi');
  const [busPaymentStatus, setBusPaymentStatus] = useState<'unpaid' | 'pending_admin_approval' | 'paid_online'>('unpaid');
  const [isBusQrModalOpen, setIsBusQrModalOpen] = useState(false);
  const [isProcessingBusPayment, setIsProcessingBusPayment] = useState(false);

  // 6. SELF PARKING & RC UPLOAD & SEMESTER/YEAR FEE STATE
  const [vehicleType, setVehicleType] = useState<'Car / SUV' | 'Bike / Scooter'>('Car / SUV');
  const [plateNumber, setPlateNumber] = useState('DL-03-CC-9912');
  const [permitDurationPlan, setPermitDurationPlan] = useState<'Per Semester Permit' | 'Annual / Full Year Permit'>('Per Semester Permit');
  const [vehicleRCFile, setVehicleRCFile] = useState<File | null>(null);

  const calculateParkingFee = () => {
    if (permitDurationPlan === 'Per Semester Permit') {
      return vehicleType === 'Car / SUV' ? 1200 : 500;
    }
    return vehicleType === 'Car / SUV' ? 2000 : 800;
  };

  // 7. LOST BUS PASS STATE
  const [dateOfLoss, setDateOfLoss] = useState('2026-08-08');
  const [lostPassReasonNotes, setLostPassReasonNotes] = useState('Lost ID badge during sports tournament at campus quad.');

  // 8. SURRENDER BUS SERVICE MULTI-SIGNATURE WORKFLOW STATE
  const [busDiscontinueDate, setBusDiscontinueDate] = useState('2026-08-31');
  const [busSurrenderReason, setBusSurrenderReason] = useState('Purchased self vehicle for daily commute.');
  const [signedBusIncharge, setSignedBusIncharge] = useState(true);
  const [signedBusHod, setSignedBusHod] = useState(true);
  const [signedBusAdmin, setSignedBusAdmin] = useState(true);
  const [signedBusNocFile, setSignedBusNocFile] = useState<File | null>(null);

  const selectedBusRoute = SAMPLE_BUS_ROUTES.find((r) => r.id === selectedRouteId) || SAMPLE_BUS_ROUTES[0];

  const calculateBusBaseFee = () => {
    let baseFee = selectedBusRoute.quarterlyFee;
    if (hasBusDisabilityDiscount) {
      return baseFee * 0.5;
    }
    return baseFee;
  };

  const calculateBusTotalPayable = () => {
    const base = calculateBusBaseFee();
    if (busPaymentMode === 'accounts_office_cash') {
      return base + 150; // Cash Handling Fee ₹150
    }
    return base;
  };

  // Document Upload Handlers
  const handleHostelDisabilityDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHostelDisabilityFile(file);
  };

  const handleBusDisabilityDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBusDisabilityFile(file);
  };

  const handleParentApprovalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setParentApprovalFile(file);
  };

  const handleComplaintEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setComplaintEvidenceFile(file);
  };

  const handleSignedNocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSignedNocFile(file);
  };

  const handleRCUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVehicleRCFile(file);
  };

  const handleSignedBusNocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSignedBusNocFile(file);
  };

  // Submit Hostel Payment or Cash Request
  const handleHostelSubmitPayment = () => {
    if (hostelPaymentMode === 'accounts_office_cash') {
      setHostelPaymentStatus('pending_admin_approval');
      alert(`⏳ CASH REQUEST SUBMITTED!\n\nPlease visit Accounts Office Counter #2 and present ₹${calculateHostelTotalPayable().toLocaleString('en-IN')} (Includes ₹150 Cash Handling Fee).\n\nYour request is PENDING until Admin / Accounts Officer approves your cash payment.`);
    } else {
      setIsHostelQrModalOpen(true);
    }
  };

  const handleConfirmHostelOnlinePayment = () => {
    setIsProcessingHostelPayment(true);
    setTimeout(() => {
      setIsProcessingHostelPayment(false);
      setIsHostelQrModalOpen(false);
      setHostelPaymentStatus('paid_online');
      alert('🎉 ONLINE PAYMENT SUCCESSFUL!\n\nHostel Allotment Fee paid & verified online. Download your official PDF receipt now.');
    }, 1500);
  };

  // Submit Bus Payment or Cash Request
  const handleBusSubmitPayment = () => {
    if (busPaymentMode === 'accounts_office_cash') {
      setBusPaymentStatus('pending_admin_approval');
      alert(`⏳ BUS CASH REQUEST SUBMITTED!\n\nPlease visit Accounts Office Counter #2 and present ₹${calculateBusTotalPayable().toLocaleString('en-IN')} (Includes ₹150 Cash Handling Fee).\n\nYour request is PENDING until Admin approves your payment.`);
    } else {
      setIsBusQrModalOpen(true);
    }
  };

  const handleConfirmBusOnlinePayment = () => {
    setIsProcessingBusPayment(true);
    setTimeout(() => {
      setIsProcessingBusPayment(false);
      setIsBusQrModalOpen(false);
      setBusPaymentStatus('paid_online');
      alert('🎉 BUS PASS ONLINE PAYMENT SUCCESSFUL!\n\nBus Pass quarterly fee paid online. Download your pass receipt now.');
    }, 1500);
  };

  // Download PDF Receipts & Vouchers
  const handleDownloadHostelPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const isPending = hostelPaymentStatus === 'pending_admin_approval';
      const docTitle = isPending ? 'ACCOUNTS OFFICE CASH VOUCHER' : 'HOSTEL ALLOTMENT RECEIPT';

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`NEXUS CAMPUS - ${docTitle}`, 74, 10, { align: 'center' });
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        isPending
          ? 'OFFICIAL PENDING CASH VOUCHER (PRESENT AT COUNTER #2)'
          : 'OFFICIAL ELECTRONIC PAYMENT RECEIPT',
        74,
        17,
        { align: 'center' }
      );

      doc.setFillColor(248, 250, 252);
      doc.rect(10, 28, 128, 24, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student Name: ${studentName}`, 14, 34);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Roll Number / Email: ${rollNumber}`, 14, 39);
      doc.text(`Mobile: ${mobileNumber} | DOB: ${dateOfBirth}`, 14, 44);
      doc.text(`Program: ${degree} (${joiningYear}) | Dept: ${department}`, 14, 49);

      let yPos = 58;
      const baseVal = calculateHostelBaseFee();
      const finalVal = hostelPaymentMode === 'accounts_office_cash' ? baseVal + 150 : baseVal;

      const details: Record<string, string> = {
        'Hostel Block': targetBlock,
        'Sharing Basis': sharingBasis,
        'Section Code': sectionCode,
        'Joining Date': joiningDate,
        'Mess Choice': messOption,
        'Disability Discount': hasHostelDisabilityConcession ? `50% Applied (${hostelDisabilityCardNo})` : 'None',
        'Payment Mode': hostelPaymentMode === 'accounts_office_cash' ? 'Pay in Accounts Office (Cash)' : 'Online UPI / NetBanking',
        'Cash Handling Fee': hostelPaymentMode === 'accounts_office_cash' ? 'Rs. 150/- Included' : 'N/A',
        'Total Payable Amount': `Rs. ${finalVal.toLocaleString('en-IN')}`,
        'Settlement Status': isPending ? 'PENDING ADMIN APPROVAL (Pay at Counter #2)' : 'PAID & APPROVED ONLINE ✓',
      };

      Object.entries(details).forEach(([key, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, 12, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${val}`, 56, yPos);
        yPos += 5.5;
      });

      if (isPending) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 119, 6);
        doc.text('INSTRUCTIONS: Present this printed voucher at Accounts Office Counter #2 with cash.', 12, yPos + 6);
      } else {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('VERIFICATION STATUS: APPROVED & VERIFIED ONLINE BY ADMIN ✓', 12, yPos + 6);
      }

      doc.save(`nexus_hostel_${isPending ? 'cash_voucher' : 'receipt'}_${Date.now()}.pdf`);
    } catch (e) {
      alert('Error generating PDF.');
    }
  };

  const handleDownloadBusPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const isPending = busPaymentStatus === 'pending_admin_approval';
      const docTitle = isPending ? 'BUS PASS CASH VOUCHER' : 'COLLEGE BUS PASS RECEIPT';

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`NEXUS CAMPUS - ${docTitle}`, 74, 10, { align: 'center' });
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        isPending
          ? 'PENDING CASH PAYMENT VOUCHER (PRESENT AT COUNTER #2)'
          : 'OFFICIAL BUS PASS ELECTRONIC RECEIPT',
        74,
        17,
        { align: 'center' }
      );

      doc.setFillColor(248, 250, 252);
      doc.rect(10, 28, 128, 24, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student Name: ${studentName}`, 14, 34);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Roll / ID: ${rollNumber}`, 14, 39);
      doc.text(`Mobile: ${mobileNumber} | DOB: ${dateOfBirth}`, 14, 44);
      doc.text(`Program: ${degree} (${department})`, 14, 49);

      let yPos = 58;
      const baseVal = calculateBusBaseFee();
      const finalVal = busPaymentMode === 'accounts_office_cash' ? baseVal + 150 : baseVal;

      const details: Record<string, string> = {
        'Bus Route': selectedBusRoute.routeNumber,
        'Pickup Stand': pickupStandInput,
        'Transit Shift': transitShift,
        'Disability Discount': hasBusDisabilityDiscount ? `50% Applied (${busDisabilityCardNo})` : 'None',
        'Payment Mode': busPaymentMode === 'accounts_office_cash' ? 'Pay in Accounts Office (Cash)' : 'Online UPI / NetBanking',
        'Cash Handling Fee': busPaymentMode === 'accounts_office_cash' ? 'Rs. 150/- Included' : 'N/A',
        'Total Fee': `Rs. ${finalVal.toLocaleString('en-IN')}`,
        'Settlement Status': isPending ? 'PENDING ADMIN APPROVAL' : 'PAID & APPROVED ONLINE ✓',
      };

      Object.entries(details).forEach(([key, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, 12, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${val}`, 52, yPos);
        yPos += 5.5;
      });

      doc.save(`nexus_bus_${isPending ? 'cash_slip' : 'receipt'}_${Date.now()}.pdf`);
    } catch (e) {
      alert('Error generating Bus PDF.');
    }
  };

  const handleDownloadWeeklyFoodMenuPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('NEXUS CAMPUS - CENTRAL DINING HALL', 105, 12, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL WEEKLY 4-MEAL FOOD MENU ROTATION SCHEDULE', 105, 20, { align: 'center' });

      let yPos = 38;
      SAMPLE_WEEKLY_MENU.forEach((m) => {
        if (yPos + 35 > 280) {
          doc.addPage();
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('NEXUS CAMPUS - CENTRAL DINING HALL (CONTINUED)', 105, 12, { align: 'center' });
          yPos = 30;
        }

        doc.setFillColor(241, 245, 249);
        doc.rect(14, yPos, 182, 8, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${m.day.toUpperCase()} MENU`, 18, yPos + 6);

        yPos += 12;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 119, 6);
        doc.text('Breakfast (07:30-09:30 AM):', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(m.breakfast, 68, yPos, { maxWidth: 125 });

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('Lunch (12:30-02:30 PM):', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(m.lunch, 68, yPos, { maxWidth: 125 });

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        doc.text('Evening Tea (05:00-06:30 PM):', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(m.snacks, 68, yPos, { maxWidth: 125 });

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Dinner (07:30-09:30 PM):', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(m.dinner, 68, yPos, { maxWidth: 125 });

        yPos += 12;
      });

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Approved by Mess Advisory Committee & Chief Executive Chef ✓', 105, yPos + 10 > 285 ? 285 : yPos + 10, { align: 'center' });

      doc.save(`nexus_weekly_food_menu_${Date.now()}.pdf`);
      alert('🎉 SUCCESS!\n\nFull 7-Day Weekly Food Menu PDF downloaded successfully.');
    } catch (e) {
      alert('Error generating Food Menu PDF.');
    }
  };

  const handleDownloadGenericReceipt = (docTitle: string, details: Record<string, string>) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`NEXUS CAMPUS - ${docTitle.toUpperCase()}`, 74, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL VERIFIED ACKNOWLEDGEMENT RECEIPT', 74, 17, { align: 'center' });

      doc.setFillColor(248, 250, 252);
      doc.rect(10, 28, 128, 22, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student Name: ${studentName}`, 14, 34);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Roll / ID: ${rollNumber}`, 14, 40);
      doc.text(`Program: ${degree} | Dept: ${department}`, 14, 45);

      let yPos = 56;
      Object.entries(details).forEach(([key, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, 12, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${val}`, 58, yPos);
        yPos += 5.5;
      });

      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('VERIFICATION STATUS: APPROVED & VERIFIED BY CLASS INCHARGE & ADMIN ✓', 12, yPos + 6);

      const fileName = `nexus_${docTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);
      alert(`🎉 SUCCESS!\n\n${docTitle} Receipt downloaded successfully.`);
    } catch (e) {
      alert('Error generating PDF.');
    }
  };

  const currentDayMenu = SAMPLE_WEEKLY_MENU.find((m) => m.day === selectedMenuDay) || SAMPLE_WEEKLY_MENU[0];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* REDESIGNED NEXUS HEADER BANNER (NO PERSONAL NAME & EMAIL IN BANNER) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            NEXUS Smart Campus OS • Residence & Transit Studio
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            Hostel Residence, Dining & Transit Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed font-mono">
            Centralized management portal for Hostel Allotment, Dining Menus, Vacation Gate Passes, Maintenance Complaints & College Transit Passes.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 z-10 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab('hostel_forms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'hostel_forms' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-500" />
            <span>Hostel Applications</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly_menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'weekly_menu' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Weekly Food Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('hostel_activities')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'hostel_activities' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4 text-rose-400" />
            <span>Weekly Activities</span>
          </button>

          <button
            onClick={() => setActiveTab('transport_hub')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'transport_hub' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Transport Hub</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: HOSTEL APPLICATIONS */}
      {activeTab === 'hostel_forms' && (
        <div className="space-y-6 w-full">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
            <button
              onClick={() => setHostelSubTab('apply')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                hostelSubTab === 'apply'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Apply & Pay Fees</span>
            </button>

            <button
              onClick={() => setHostelSubTab('concern')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                hostelSubTab === 'concern'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Room Change, Vacation & Maintenance</span>
            </button>

            <button
              onClick={() => setHostelSubTab('surrender')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                hostelSubTab === 'surrender'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Completely Leave Hostel</span>
            </button>
          </div>

          {/* SUB-TAB 1: APPLY & PAY FEES */}
          {hostelSubTab === 'apply' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-500" />
                    Hostel Allotment & Mess Fee Application Form
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive student database fields (Mobile Number, DOB), Mess options & Payment Gateways.
                  </p>
                </div>
              </div>

              {/* DYNAMIC ACADEMIC PROFILE FORM WITH MOBILE NUMBER & DOB FROM DATABASE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name *:</label>
                  <input
                    type="text"
                    value={studentName}
                    readOnly
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Roll / ID Number *:</label>
                  <input
                    type="text"
                    value={rollNumber}
                    readOnly
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Contact Phone *:</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth (DOB) *:</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Degree / Program:</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="BBA">BBA (Bachelor of Business Admin)</option>
                    <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                    <option value="MBA">MBA (Master of Business Admin)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joining Year:</label>
                  <select
                    value={joiningYear}
                    onChange={(e) => setJoiningYear(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs font-mono"
                  >
                    <option value="2023">2023 Batch</option>
                    <option value="2024">2024 Batch</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2026">2026 Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department:</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Civil Engineering">Civil Engineering (CE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Finance">School of Finance & Economics</option>
                    <option value="HR & Marketing">HR & Strategic Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Semester:</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Section Code:</label>
                  <input
                    type="text"
                    value={sectionCode}
                    onChange={(e) => setSectionCode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Joining Date:</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Room Sharing Basis:</label>
                  <select
                    value={sharingBasis}
                    onChange={(e) => setSharingBasis(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Single">Single Occupancy Room</option>
                    <option value="Double">Double Sharing Room</option>
                    <option value="Triple">Triple Sharing Room</option>
                    <option value="Quadruple">Quadruple Sharing Room</option>
                    <option value="Deluxe Suite (Attached Washroom & Mini Kitchen)">Deluxe Suite (Attached Washroom & Kitchen)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hostel Block:</label>
                  <select
                    value={targetBlock}
                    onChange={(e) => setTargetBlock(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Hostel Block A (Boys)">Hostel Block A (Boys)</option>
                    <option value="Hostel Block B (Boys)">Hostel Block B (Boys)</option>
                    <option value="Hostel Block A (Girls)">Hostel Block A (Girls)</option>
                    <option value="Hostel Block C (Deluxe PG)">Hostel Block C (Deluxe PG)</option>
                  </select>
                </div>
              </div>

              {/* MESS PLAN SELECTOR */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Select Mess Plan Option (With Mess vs Without Mess):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMessOption('With Mess (Full 4-Meal Plan)')}
                    className={`p-5 rounded-2xl border font-bold text-left transition-all ${
                      messOption === 'With Mess (Full 4-Meal Plan)'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl ring-2 ring-indigo-400/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-amber-300" />
                      <span className="font-black text-sm">With Mess (Full 4-Meal Plan)</span>
                    </div>
                    <p className="text-xs opacity-90 mt-1">
                      Includes Breakfast, Lunch, Evening Tea/Snacks & Dinner in Central Dining Hall.
                    </p>
                    <div className="mt-3 font-mono font-black text-lg">
                      Base Fee: ₹{hasHostelDisabilityConcession ? '22,500' : '45,000'} / Sem
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessOption('Without Mess (Self Cooking / Canteen)')}
                    className={`p-5 rounded-2xl border font-bold text-left transition-all ${
                      messOption === 'Without Mess (Self Cooking / Canteen)'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl ring-2 ring-indigo-400/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-300" />
                      <span className="font-black text-sm">Without Mess (Room Stay Only)</span>
                    </div>
                    <p className="text-xs opacity-90 mt-1">
                      Hostel room accommodation only. Meals can be purchased separately at Canteen.
                    </p>
                    <div className="mt-3 font-mono font-black text-lg">
                      Base Fee: ₹{hasHostelDisabilityConcession ? '15,000' : '30,000'} / Sem
                    </div>
                  </button>
                </div>
              </div>

              {/* DISABILITY CONCESSION OPTION */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 w-full text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHostelDisabilityConcession}
                    onChange={(e) => setHasHostelDisabilityConcession(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Apply Student Disability Concession (50% Fee Discount on Hostel Allotment)</span>
                </label>

                {hasHostelDisabilityConcession && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Govt Disability Card Number:</label>
                      <input
                        type="text"
                        value={hostelDisabilityCardNo}
                        onChange={(e) => setHostelDisabilityCardNo(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Upload Disability Certificate Document:
                      </label>
                      <label className="w-full py-3 px-4 rounded-xl border border-dashed border-indigo-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition-all">
                        <Paperclip className="w-4 h-4 text-indigo-500" />
                        <span>{hostelDisabilityFile ? `Attached: ${hostelDisabilityFile.name}` : 'Click to Upload Disability Certificate'}</span>
                        <input type="file" onChange={handleHostelDisabilityDocUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD SELECTOR GRID */}
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Select Payment Method:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setHostelPaymentMode('online_upi')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      hostelPaymentMode === 'online_upi'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-purple-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Online Razorpay / UPI</p>
                      <span className="text-[10px] opacity-80 block font-normal">GPay, PhonePe, Paytm QR</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHostelPaymentMode('online_netbanking')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      hostelPaymentMode === 'online_netbanking'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-indigo-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Online Net Banking</p>
                      <span className="text-[10px] opacity-80 block font-normal">SBI, HDFC, ICICI, Axis</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHostelPaymentMode('accounts_office_cash')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      hostelPaymentMode === 'accounts_office_cash'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Pay in Accounts Office</p>
                      <span className="text-[10px] text-amber-200 block font-bold">+₹150 Cash Handling Fee</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* PAYMENT BREAKDOWN SUMMARY BOX */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Base Fee ({messOption.split(' ')[0]}):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{calculateHostelBaseFee().toLocaleString('en-IN')}
                  </span>
                </div>

                {hostelPaymentMode === 'accounts_office_cash' && (
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                    <span>Accounts Office Cash Handling Fee:</span>
                    <span className="font-mono font-bold">+₹150.00</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount Payable:</span>
                  <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    ₹{calculateHostelTotalPayable().toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* ACTION BUTTONS & STATUS */}
              <div className="pt-2">
                {hostelPaymentStatus === 'unpaid' && (
                  <button
                    onClick={handleHostelSubmitPayment}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                  >
                    {hostelPaymentMode === 'accounts_office_cash' ? (
                      <>
                        <Coins className="w-5 h-5 text-amber-300" />
                        <span>Submit Pay at Accounts Office Request (₹{calculateHostelTotalPayable().toLocaleString('en-IN')})</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 text-cyan-300" />
                        <span>Pay Online via UPI / NetBanking (₹{calculateHostelTotalPayable().toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                )}

                {hostelPaymentStatus === 'pending_admin_approval' && (
                  <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-900 dark:text-amber-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-amber-500 shrink-0 animate-pulse" />
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          ⏳ REQUEST PENDING ADMIN / ACCOUNTS APPROVAL
                        </h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                          Please visit Accounts Office Counter #2 and present <strong>₹{calculateHostelTotalPayable().toLocaleString('en-IN')}</strong> (includes ₹150 Cash Handling Fee). Status will automatically switch to APPROVED once cash is collected.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-amber-300/40">
                      <button
                        onClick={handleDownloadHostelPDF}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Accounts Office Cash Voucher (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

                {hostelPaymentStatus === 'paid_online' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-900 dark:text-emerald-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          ✅ HOSTEL FEE PAID & APPROVED ONLINE
                        </h4>
                        <p className="text-xs opacity-90">
                          Payment of <strong>₹{calculateHostelTotalPayable().toLocaleString('en-IN')}</strong> settled online. Download your official PDF receipt.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-emerald-300/40">
                      <button
                        onClick={handleDownloadHostelPDF}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Official Hostel Receipt (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: ROOM CHANGE, VACATION & MAINTENANCE COMPLAINT (WITH DATES & MEDIA FILE UPLOAD) */}
          {hostelSubTab === 'concern' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-indigo-500" />
                    Hostel Room Change, Vacation Pass & Maintenance Complaints
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive forms with exact start/end dates and Media / Proof File Upload capability.
                  </p>
                </div>
              </div>

              <div className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Request Category:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setConcernCategory('Room Change Request')}
                      className={`p-3.5 rounded-xl border font-bold text-center transition-all ${
                        concernCategory === 'Room Change Request'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Room Change Application
                    </button>

                    <button
                      type="button"
                      onClick={() => setConcernCategory('Vacation Leave Pass')}
                      className={`p-3.5 rounded-xl border font-bold text-center transition-all ${
                        concernCategory === 'Vacation Leave Pass'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Vacation Leave Gate Pass
                    </button>

                    <button
                      type="button"
                      onClick={() => setConcernCategory('Maintenance / Complaint')}
                      className={`p-3.5 rounded-xl border font-bold text-center transition-all ${
                        concernCategory === 'Maintenance / Complaint'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Maintenance & Repair Complaint
                    </button>
                  </div>
                </div>

                {/* FORM CATEGORY 1: ROOM CHANGE REQUEST */}
                {concernCategory === 'Room Change Request' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Target Room Number Only:</label>
                          <input
                            type="text"
                            placeholder="e.g. C-201, A-202, B-304, A-104..."
                            value={targetRoomNumberInput}
                            onChange={(e) => setTargetRoomNumberInput(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600 text-sm"
                          />
                        </div>

                        <div className="flex flex-col justify-center">
                          {matchedTargetRoom ? (
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  Target Room {matchedTargetRoom.roomNumber} is Available ✓
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 space-y-1">
                              <span className="font-black text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                Target Room {targetRoomNumberInput || 'entered'} is Full / Not Available ❌
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Room Change:</label>
                      <textarea
                        rows={3}
                        value={concernReason}
                        onChange={(e) => setConcernReason(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                      />
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadGenericReceipt('Room Change Application', {
                          'Target Room': targetRoomNumberInput,
                          'Reason': concernReason,
                        })
                      }
                      className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>Submit Room Change Application & Download PDF</span>
                    </button>
                  </div>
                )}

                {/* FORM CATEGORY 2: VACATION LEAVE GATE PASS (WITH DATES & PARENT APPROVAL UPLOAD) */}
                {concernCategory === 'Vacation Leave Pass' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vacation Start Date *:</label>
                        <input
                          type="date"
                          value={vacationStartDate}
                          onChange={(e) => setVacationStartDate(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Return / End Date *:</label>
                        <input
                          type="date"
                          value={vacationEndDate}
                          onChange={(e) => setVacationEndDate(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vacation Leave Reason & Outstation Address *:</label>
                      <textarea
                        rows={3}
                        value={vacationReason}
                        onChange={(e) => setVacationReason(e.target.value)}
                        placeholder="Provide details about outstation leave address, parent consent..."
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                      />
                    </div>

                    {/* PARENT APPROVAL FILE UPLOAD */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <label className="block font-bold text-slate-900 dark:text-white mb-1">
                        Upload Parent Consent Letter / Approval Document:
                      </label>
                      <label className="w-full py-3 px-4 rounded-xl border border-dashed border-indigo-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition-all">
                        <Upload className="w-4 h-4 text-indigo-500" />
                        <span>{parentApprovalFile ? `Attached: ${parentApprovalFile.name}` : 'Click to Upload Parent Approval Letter (PNG/JPG/PDF)'}</span>
                        <input type="file" onChange={handleParentApprovalDocUpload} className="hidden" />
                      </label>
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadGenericReceipt('Vacation Leave Gate Pass', {
                          'Start Date': vacationStartDate,
                          'Return Date': vacationEndDate,
                          'Outstation Reason': vacationReason,
                          'Parent Consent Document': parentApprovalFile ? parentApprovalFile.name : 'Attached ✓',
                          'Gate Pass Clearance': 'Approved by Warden & Chief Security Officer ✓',
                        })
                      }
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>Issue Vacation Gate Pass & Download PDF</span>
                    </button>
                  </div>
                )}

                {/* FORM CATEGORY 3: MAINTENANCE / COMPLAINT (WITH DATES & MEDIA FILE UPLOAD) */}
                {concernCategory === 'Maintenance / Complaint' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Complaint Category *:</label>
                        <select
                          value={complaintCategory}
                          onChange={(e) => setComplaintCategory(e.target.value as any)}
                          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        >
                          <option value="Plumbing & Water">Plumbing & Water</option>
                          <option value="Electrical & Lighting">Electrical & Lighting</option>
                          <option value="Furniture & Bed">Furniture & Bed Repair</option>
                          <option value="Cleanliness & Hygiene">Cleanliness & Hygiene</option>
                          <option value="Wi-Fi & Internet">Wi-Fi & Internet LAN</option>
                          <option value="AC & Ventilation">AC & Ventilation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Incident / Issue Date *:</label>
                        <input
                          type="date"
                          value={incidentDate}
                          onChange={(e) => setIncidentDate(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Room Number *:</label>
                        <input
                          type="text"
                          value={maintenanceLocation}
                          onChange={(e) => setMaintenanceLocation(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description of Issue *:</label>
                      <textarea
                        rows={3}
                        value={maintenanceDescription}
                        onChange={(e) => setMaintenanceDescription(e.target.value)}
                        placeholder="Describe the maintenance issue clearly for estate officer..."
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                      />
                    </div>

                    {/* MAINTENANCE EVIDENCE MEDIA FILE UPLOAD */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                      <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                        Upload Photo / Media Evidence of Maintenance Issue:
                      </label>
                      <label className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-all">
                        <Paperclip className="w-4 h-4 text-amber-500" />
                        <span>{complaintEvidenceFile ? `Attached: ${complaintEvidenceFile.name}` : 'Click to Upload Photo Evidence (PNG/JPG)'}</span>
                        <input type="file" accept="image/*" onChange={handleComplaintEvidenceUpload} className="hidden" />
                      </label>
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadGenericReceipt('Hostel Maintenance Ticket', {
                          'Category': complaintCategory,
                          'Incident Date': incidentDate,
                          'Location': maintenanceLocation,
                          'Description': maintenanceDescription,
                          'Photo Evidence': complaintEvidenceFile ? complaintEvidenceFile.name : 'Attached ✓',
                          'Ticket Status': 'Dispatched to Campus Maintenance Team ✓',
                        })
                      }
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span>Submit Maintenance Ticket & Download Receipt (PDF)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: COMPLETELY LEAVE HOSTEL (MULTI-SIGNATURE APPROVAL WORKFLOW) */}
          {hostelSubTab === 'surrender' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Completely Leave Hostel (Permanent Surrender NOC Form)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Application requires signed approval by Class Incharge, HOD, Warden & Campus Admin.
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>4-Level Signature Authority Verified ✓</span>
                </div>
              </div>

              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Effective Vacating Date *:</label>
                    <input
                      type="date"
                      value={vacatingDate}
                      onChange={(e) => setVacatingDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Caution Deposit Refund Bank Details *:</label>
                    <input
                      type="text"
                      value={refundBankAcc}
                      onChange={(e) => setRefundBankAcc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Permanently Vacating Hostel *:</label>
                  <textarea
                    rows={3}
                    value={surrenderReason}
                    onChange={(e) => setSurrenderReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>

                {/* 4-LEVEL APPROVAL CHECKLIST & SIGNED NOC DOCUMENT UPLOADER */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Required Signatures Approval Verification Checklist:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-bold">
                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedInchargeApproval}
                        onChange={(e) => setSignedInchargeApproval(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>✍️ 1. Class Incharge Signed Approval</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedHodApproval}
                        onChange={(e) => setSignedHodApproval(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>✍️ 2. HOD Signed Approval</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedWardenApproval}
                        onChange={(e) => setSignedWardenApproval(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>✍️ 3. Chief Hostel Warden Signed Approval</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedAdminClearance}
                        onChange={(e) => setSignedAdminClearance(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>✍️ 4. Campus Finance Admin Clearance</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Signed Hostel Exit NOC Document (Signed by Class Incharge, HOD & Warden):
                    </label>
                    <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-rose-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-rose-600 font-bold text-xs hover:bg-rose-50 transition-all">
                      <Upload className="w-4 h-4 text-rose-500" />
                      <span>{signedNocFile ? `Attached NOC: ${signedNocFile.name}` : 'Click to Upload Signed NOC Application Document (PDF/JPG)'}</span>
                      <input type="file" onChange={handleSignedNocUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleDownloadGenericReceipt('Permanent Hostel Surrender NOC', {
                    'Vacating Date': vacatingDate,
                    'Exit Reason': surrenderReason,
                    'Signatures Verification': 'Class Incharge ✓ | HOD ✓ | Warden ✓ | Admin ✓',
                    'Attached Signed NOC': signedNocFile ? signedNocFile.name : 'Attached ✓',
                  })
                }
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-sm shadow-xl hover:from-rose-500 hover:to-red-500 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Submit Signed Application & Download NOC Receipt (PDF)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: WEEKLY MESS FOOD MENU GRID */}
      {activeTab === 'weekly_menu' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                Central Dining Hall Weekly Food Menu (4 Meals Daily)
              </h3>
              <p className="text-xs text-slate-500">
                Weekly rotation schedule for Breakfast, Lunch, Evening Snacks & Dinner prepared by Chef Team.
              </p>
            </div>

            <button
              onClick={handleDownloadWeeklyFoodMenuPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full 7-Day Food Menu (PDF)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedMenuDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex-1 text-center ${
                  selectedMenuDay === day
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 relative overflow-hidden text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase">
                  🥞 BREAKFAST
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">07:30 AM - 09:30 AM</span>
              </div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">{selectedMenuDay} Breakfast</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentDayMenu.breakfast}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 relative overflow-hidden text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                  🍲 LUNCH
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">12:30 PM - 02:30 PM</span>
              </div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">{selectedMenuDay} Lunch</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentDayMenu.lunch}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 space-y-3 relative overflow-hidden text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-black text-[10px] uppercase">
                  ☕ EVENING SNACKS
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">05:00 PM - 06:30 PM</span>
              </div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">{selectedMenuDay} Snacks & Tea</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentDayMenu.snacks}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 relative overflow-hidden text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase">
                  🍛 DINNER
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">07:30 PM - 09:30 PM</span>
              </div>
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white">{selectedMenuDay} Dinner</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentDayMenu.dinner}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: WEEKLY ACTIVITIES */}
      {activeTab === 'hostel_activities' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-rose-500" />
                Weekly Hostel Student Activities & Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Weekly activities schedule for students with dates, timings, venue & descriptions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {SAMPLE_WEEKLY_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 hover:border-rose-500 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase">
                    {act.day}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold">{act.date}</span>
                </div>

                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">{act.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{act.description}</p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {act.time}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {act.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: TRANSPORT HUB */}
      {activeTab === 'transport_hub' && (
        <div className="space-y-6 w-full">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
            <button
              onClick={() => setTransportSubTab('join_bus')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                transportSubTab === 'join_bus'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Apply for Bus Service</span>
            </button>

            <button
              onClick={() => setTransportSubTab('self_parking')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                transportSubTab === 'self_parking'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Self Parking & RC Upload</span>
            </button>

            <button
              onClick={() => setTransportSubTab('lost_pass')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                transportSubTab === 'lost_pass'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Lost Bus Pass</span>
            </button>

            <button
              onClick={() => setTransportSubTab('leave_bus')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                transportSubTab === 'leave_bus'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Surrender Bus Service</span>
            </button>
          </div>

          {/* SUB-TAB 1: APPLY FOR BUS SERVICE (NAME, DEPT & DISABILITY OPTION) */}
          {transportSubTab === 'join_bus' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Bus className="w-5 h-5 text-emerald-500" />
                    College Bus Service Registration Application
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive student fields, route selection & Disability Concession (50% Off).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name *:</label>
                  <input
                    type="text"
                    value={studentName}
                    readOnly
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Roll / ID Number *:</label>
                  <input
                    type="text"
                    value={rollNumber}
                    readOnly
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Contact Phone *:</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department *:</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Civil Engineering">Civil Engineering (CE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Finance">School of Finance & Economics</option>
                    <option value="HR & Marketing">HR & Strategic Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Degree / Program:</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="BBA">BBA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="MBA">MBA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Bus Route *:</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    {SAMPLE_BUS_ROUTES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.routeNumber} ({r.pickupStand.substring(0, 25)}...) - ₹{r.quarterlyFee}/Qtr
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Stand:</label>
                  <input
                    type="text"
                    value={pickupStandInput}
                    onChange={(e) => setPickupStandInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transit Shift Timing:</label>
                  <select
                    value={transitShift}
                    onChange={(e) => setTransitShift(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Morning 07:30 AM Shift">Morning 07:30 AM Shift</option>
                    <option value="Afternoon 02:30 PM Shift">Afternoon 02:30 PM Shift</option>
                  </select>
                </div>
              </div>

              {/* DISABILITY CONCESSION OPTION FOR BUS SERVICE */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 w-full text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBusDisabilityDiscount}
                    onChange={(e) => setHasBusDisabilityDiscount(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Apply Student Disability Concession (50% Fee Discount on Bus Service Pass)</span>
                </label>

                {hasBusDisabilityDiscount && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Govt Disability Card Number:</label>
                      <input
                        type="text"
                        value={busDisabilityCardNo}
                        onChange={(e) => setBusDisabilityCardNo(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Upload Disability Certificate Document:
                      </label>
                      <label className="w-full py-3 px-4 rounded-xl border border-dashed border-emerald-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-emerald-600 font-bold text-xs hover:bg-emerald-100 transition-all">
                        <Paperclip className="w-4 h-4 text-emerald-500" />
                        <span>{busDisabilityFile ? `Attached: ${busDisabilityFile.name}` : 'Click to Upload Disability Certificate'}</span>
                        <input type="file" onChange={handleBusDisabilityDocUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD SELECTOR FOR BUS */}
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Select Transport Payment Gateway:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBusPaymentMode('online_upi')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      busPaymentMode === 'online_upi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Online Razorpay / UPI</p>
                      <span className="text-[10px] opacity-80 block font-normal">Instant QR Scan</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusPaymentMode('online_netbanking')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      busPaymentMode === 'online_netbanking'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-indigo-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Online Net Banking</p>
                      <span className="text-[10px] opacity-80 block font-normal">SBI, HDFC, ICICI</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusPaymentMode('accounts_office_cash')}
                    className={`p-4 rounded-2xl border font-bold text-left transition-all flex items-center gap-3 ${
                      busPaymentMode === 'accounts_office_cash'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <p className="font-black text-xs">Pay in Accounts Office</p>
                      <span className="text-[10px] text-amber-200 block font-bold">+₹150 Cash Handling Fee</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS FOR BUS */}
              <div className="pt-2">
                {busPaymentStatus === 'unpaid' && (
                  <button
                    onClick={handleBusSubmitPayment}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
                  >
                    {busPaymentMode === 'accounts_office_cash' ? (
                      <>
                        <Coins className="w-5 h-5 text-amber-300" />
                        <span>Submit Pay at Accounts Office Request (₹{calculateBusTotalPayable().toLocaleString('en-IN')})</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 text-cyan-300" />
                        <span>Pay Bus Fee Online (₹{calculateBusTotalPayable().toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                )}

                {busPaymentStatus === 'pending_admin_approval' && (
                  <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-900 dark:text-amber-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-amber-500 shrink-0 animate-pulse" />
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          ⏳ BUS CASH REQUEST PENDING ADMIN APPROVAL
                        </h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                          Please visit Accounts Office Counter #2 and present <strong>₹{calculateBusTotalPayable().toLocaleString('en-IN')}</strong> (includes ₹150 Cash Handling Fee).
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-amber-300/40">
                      <button
                        onClick={handleDownloadBusPDF}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Bus Pass Cash Voucher (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}

                {busPaymentStatus === 'paid_online' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-900 dark:text-emerald-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          ✅ BUS PASS PAID & APPROVED ONLINE
                        </h4>
                        <p className="text-xs opacity-90">
                          Payment of <strong>₹{calculateBusTotalPayable().toLocaleString('en-IN')}</strong> settled online. Download your bus pass receipt.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-emerald-300/40">
                      <button
                        onClick={handleDownloadBusPDF}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Official Bus Pass Receipt (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: SELF PARKING & RC UPLOAD & SEMESTER/YEAR FEES SYSTEM */}
          {transportSubTab === 'self_parking' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full text-xs">
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-500" />
                Self Vehicle Campus Parking Permit & Vehicle RC Registration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Category *:</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Car / SUV">Four-Wheeler (Car / SUV)</option>
                    <option value="Bike / Scooter">Two-Wheeler (Bike / Scooter)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Registration Plate Number *:</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Permit Duration & Fee Plan *:</label>
                  <select
                    value={permitDurationPlan}
                    onChange={(e) => setPermitDurationPlan(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                  >
                    <option value="Per Semester Permit">Per Semester Permit ({vehicleType === 'Car / SUV' ? '₹1,200' : '₹500'})</option>
                    <option value="Annual / Full Year Permit">Annual / Full Year Permit ({vehicleType === 'Car / SUV' ? '₹2,000' : '₹800'})</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD VEHICLE RC DOCUMENT */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <label className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                  Upload Vehicle RC (Registration Certificate) Document *:
                </label>
                <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-emerald-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-emerald-600 font-bold text-xs hover:bg-emerald-100 transition-all">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>{vehicleRCFile ? `Attached Vehicle RC: ${vehicleRCFile.name}` : 'Click to Upload Vehicle RC Copy (PNG/JPG/PDF)'}</span>
                  <input type="file" onChange={handleRCUpload} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Parking Permit Fee ({permitDurationPlan}):</span>
                <strong className="text-xl font-black text-emerald-600 font-mono">
                  ₹{calculateParkingFee().toLocaleString('en-IN')}
                </strong>
              </div>

              <button
                onClick={() =>
                  handleDownloadGenericReceipt('Campus Parking Permit Pass', {
                    'Vehicle Type': vehicleType,
                    'Plate Number': plateNumber,
                    'Permit Plan': permitDurationPlan,
                    'Vehicle RC Attached': vehicleRCFile ? vehicleRCFile.name : 'Attached ✓',
                    'Permit Fee': `₹${calculateParkingFee().toLocaleString('en-IN')} (Paid ✓)`,
                  })
                }
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl hover:bg-emerald-500 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Issue Parking Pass & Download PDF</span>
              </button>
            </div>
          )}

          {/* SUB-TAB 3: LOST BUS PASS */}
          {transportSubTab === 'lost_pass' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full text-xs">
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                Duplicate Bus Pass Application (Lost Pass)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date when lost:</label>
                  <input
                    type="date"
                    value={dateOfLoss}
                    onChange={(e) => setDateOfLoss(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation:</label>
                  <textarea
                    rows={3}
                    value={lostPassReasonNotes}
                    onChange={(e) => setLostPassReasonNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  handleDownloadGenericReceipt('Duplicate Bus Pass Request', {
                    'Date Lost': dateOfLoss,
                    'Notes': lostPassReasonNotes,
                    'Duplicate Fee': '₹100 (Billed to Next Semester)',
                  })
                }
                className="w-full py-4 rounded-2xl bg-amber-600 text-white font-black text-sm shadow-xl hover:bg-amber-500 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Submit Lost Pass Form & Download Receipt</span>
              </button>
            </div>
          )}

          {/* SUB-TAB 4: SURRENDER BUS SERVICE (MULTI-SIGNATURE APPROVAL WORKFLOW) */}
          {transportSubTab === 'leave_bus' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full text-xs">
              <h3 className="font-display font-black text-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Discontinue College Bus Service Application (Signed NOC Form)
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Effective Discontinue Date *:</label>
                    <input
                      type="date"
                      value={busDiscontinueDate}
                      onChange={(e) => setBusDiscontinueDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Discontinuing *:</label>
                    <input
                      type="text"
                      value={busSurrenderReason}
                      onChange={(e) => setBusSurrenderReason(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                {/* MULTI-SIGNATURE APPROVAL CHECKLIST & FILE UPLOAD FOR BUS SURRENDER */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    Required Signatures Approval Verification Checklist:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold">
                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedBusIncharge}
                        onChange={(e) => setSignedBusIncharge(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>✍️ 1. Class Incharge Signed</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedBusHod}
                        onChange={(e) => setSignedBusHod(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>✍️ 2. HOD Signed Approval</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signedBusAdmin}
                        onChange={(e) => setSignedBusAdmin(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>✍️ 3. Transport Admin Signed</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Signed Bus Surrender Application Document (Signed by Class Incharge, Admin & HOD) *:
                    </label>
                    <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-rose-400 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 cursor-pointer text-rose-600 font-bold text-xs hover:bg-rose-50 transition-all">
                      <Upload className="w-4 h-4 text-rose-500" />
                      <span>{signedBusNocFile ? `Attached Application: ${signedBusNocFile.name}` : 'Click to Upload Signed Bus Surrender Application (PDF/JPG)'}</span>
                      <input type="file" onChange={handleSignedBusNocUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleDownloadGenericReceipt('Bus Service Surrender NOC', {
                    'Effective Date': busDiscontinueDate,
                    'Reason': busSurrenderReason,
                    'Signatures Verification': 'Class Incharge ✓ | Admin ✓ | HOD ✓',
                    'Attached Application': signedBusNocFile ? signedBusNocFile.name : 'Attached ✓',
                  })
                }
                className="w-full py-4 rounded-2xl bg-rose-600 text-white font-black text-sm shadow-xl hover:bg-rose-500 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Submit Signed Application & Download NOC (PDF)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ONLINE HOSTEL PAYMENT QR CODE MODAL */}
      {isHostelQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 text-xs text-left relative">
            <button
              onClick={() => setIsHostelQrModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Razorpay UPI / NetBanking Gateway
                </h3>
                <p className="text-[11px] text-slate-400">Scan QR via GPay, PhonePe, Paytm, or BHIM UPI</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=nexus.hostel@icici%26pn=NEXUS_CAMPUS_HOSTEL%26am=${calculateHostelTotalPayable()}%26cu=INR`}
                alt="UPI Payment QR Code"
                className="w-40 h-40 mx-auto rounded-xl shadow-md border-4 border-white dark:border-slate-800"
              />
              <span className="font-mono text-xs font-black text-purple-700 dark:text-purple-300 block">
                Payable Amount: ₹{calculateHostelTotalPayable().toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleConfirmHostelOnlinePayment}
              disabled={isProcessingHostelPayment}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
            >
              {isProcessingHostelPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment Settlement...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Payment Completed (Simulate)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ONLINE BUS PAYMENT QR CODE MODAL */}
      {isBusQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 text-xs text-left relative">
            <button
              onClick={() => setIsBusQrModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Bus Pass Online Gateway
                </h3>
                <p className="text-[11px] text-slate-400">Scan QR Code via UPI App</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=nexus.transport@icici%26pn=NEXUS_BUS_PASS%26am=${calculateBusTotalPayable()}%26cu=INR`}
                alt="Bus Pass UPI QR Code"
                className="w-40 h-40 mx-auto rounded-xl shadow-md border-4 border-white dark:border-slate-800"
              />
              <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                Total Bus Fee: ₹{calculateBusTotalPayable().toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleConfirmBusOnlinePayment}
              disabled={isProcessingBusPayment}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
            >
              {isProcessingBusPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Settlement...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Bus Payment (Simulate)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
