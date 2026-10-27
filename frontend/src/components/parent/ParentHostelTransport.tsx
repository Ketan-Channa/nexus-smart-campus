import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bus,
  MapPin,
  CheckCircle2,
  CreditCard,
  User,
  ShieldCheck,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentHostelTransportProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentHostelTransport: React.FC<ParentHostelTransportProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/services/hostel-transport?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setDetails(json.details || null);
      }
    } catch (err) {
      console.error('Fetch services error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [parentEmail, selectedChild?.roll_number]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Hostel & Campus Transport Services
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative residential allotment and transport pass details for {selectedChild?.full_name}
          </p>
        </div>

        <button
          onClick={fetchServices}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hostel Accommodation Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Hostel Allotment
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200/50">
                {details?.residence_type || 'Hosteller'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {details?.hostel_name || 'PCTE International Guest House'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Room Number: <strong className="text-slate-800 dark:text-slate-200">{details?.room_number || 'TT-8'}</strong> (Double Occupancy)
            </p>

            <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Payment Term:</span>
                <strong className="text-slate-800 dark:text-slate-200">{details?.hostel_payment_term || 'Semester-wise'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Fee Amount:</span>
                <strong className="text-slate-800 dark:text-slate-200">₹{details?.hostel_fee || '35,000'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{details?.hostel_payment_status || 'Verified'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Mess Plan:</span>
                <strong className="text-slate-800 dark:text-slate-200">Active (Standard Veg + Egg)</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Hostel Warden Desk:</span>
            <a href="tel:+911612888533" className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 161 2888533</span>
            </a>
          </div>
        </div>

        {/* Transport Route & Pass Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Transit & Commute
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                {details?.conveyance_mode || 'Campus Transit'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {details?.bus_route || 'Route 4 (Central Campus via Civil Lines)'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Designated Boarding Stop: <strong className="text-slate-800 dark:text-slate-200">Main Campus North Gate</strong>
            </p>

            <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span>Conveyance Mode:</span>
                <strong className="text-slate-800 dark:text-slate-200">{details?.conveyance_mode || 'University Bus'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Annual Transport Fee:</span>
                <strong className="text-slate-800 dark:text-slate-200">₹{details?.bus_charges || '12,000'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pass Status:</span>
                <strong className="text-teal-600 dark:text-teal-400">{details?.bus_payment_status || 'Active / Authorized'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Vehicle Registration:</span>
                <strong className="text-slate-800 dark:text-slate-200">{details?.vehicle_type || 'N/A (Campus Bus)'}</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Transport Control Desk:</span>
            <a href="tel:+911612888500" className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 161 2888500</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
