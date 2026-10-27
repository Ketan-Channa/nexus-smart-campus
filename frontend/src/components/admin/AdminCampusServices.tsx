import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Bus,
  Home,
  Plus,
  RefreshCw,
  Edit2,
  X,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const AdminCampusServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'canteen' | 'hostel_transport'>('canteen');
  const [canteenData, setCanteenData] = useState<{ items: any[]; recentOrders: any[] }>({
    items: [],
    recentOrders: [],
  });
  const [serviceData, setServiceData] = useState<{
    hostelStats: any[];
    transportStats: any[];
    allocations: any[];
  }>({
    hostelStats: [],
    transportStats: [],
    allocations: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Canteen Item Modal
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [itemForm, setItemForm] = useState({
    itemId: null as any,
    name: '',
    price: '',
    originalPrice: '',
    category: 'Beverages',
    isVeg: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/canteen/overview'),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/services/hostel-transport'),
      ]);
      const cData = await cRes.json();
      const sData = await sRes.json();
      if (cData.status === 'success') setCanteenData(cData);
      if (sData.status === 'success') setServiceData(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/canteen/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          price: Number(itemForm.price),
          originalPrice: Number(itemForm.originalPrice || itemForm.price),
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowItemModal(false);
        setItemForm({ itemId: null, name: '', price: '', originalPrice: '', category: 'Beverages', isVeg: true });
        fetchData();
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
            <Coffee className="w-5 h-5 text-amber-400" />
            Campus Services: Canteen, Hostel & Transport Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dining outlet pricing, manage student residence room blocks, and audit transit routes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'canteen' && (
            <button
              onClick={() => {
                setItemForm({ itemId: null, name: '', price: '', originalPrice: '', category: 'Beverages', isVeg: true });
                setShowItemModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Menu Item
            </button>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('canteen')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'canteen'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Canteen Menu & Orders ({canteenData.items?.length || 0} items)
        </button>
        <button
          onClick={() => setActiveTab('hostel_transport')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'hostel_transport'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Hostel Allotments & Transport Fleet ({serviceData.allocations?.length || 0} students)
        </button>
      </div>

      {/* Content */}
      {activeTab === 'canteen' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {canteenData.items?.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold">
                    ₹{item.price}
                    {item.original_price > item.price && (
                      <span className="line-through text-slate-500 text-[10px] ml-1.5">₹{item.original_price}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {item.is_veg ? '🌱 Pure Vegetarian' : '🍗 Non-Vegetarian'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => {
                      setItemForm({
                        itemId: item.id,
                        name: item.name,
                        price: String(item.price),
                        originalPrice: String(item.original_price),
                        category: item.category || 'Beverages',
                        isVeg: item.is_veg === 1 || item.is_veg === true,
                      });
                      setShowItemModal(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Pricing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-400" /> Hostel Residents by Block
              </h4>
              <div className="space-y-1.5">
                {serviceData.hostelStats?.map((h, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                    <span className="text-slate-200">{h.hostel_name}</span>
                    <span className="font-mono text-white font-bold">{h.occupants} Residents</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-sky-400" /> Transit Bus Subscriptions
              </h4>
              <div className="space-y-1.5">
                {serviceData.transportStats?.map((t, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                    <span className="text-slate-200">{t.conveyance_mode}</span>
                    <span className="font-mono text-white font-bold">{t.users} Subscribed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Table */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Hostel & Room</th>
                    <th className="py-3 px-4">Transport Mode</th>
                    <th className="py-3 px-4">Payment Dues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {serviceData.allocations?.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{s.full_name}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">{s.roll_number}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{s.class}</td>
                      <td className="py-3 px-4">
                        {s.hostel_name ? (
                          <div>
                            <span className="text-amber-300 font-medium">{s.hostel_name}</span>
                            <div className="text-[10px] text-slate-400 font-mono">Room: {s.room_number || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Day Scholar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {s.conveyance_mode || 'Self'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.hostel_payment_status === 'Paid' || s.bus_payment_status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {s.hostel_payment_status || s.bus_payment_status || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                Configure Canteen Item
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa or Cold Coffee"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.originalPrice}
                    onChange={(e) => setItemForm({ ...itemForm, originalPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Meals & Thali">Meals & Thali</option>
                  <option value="Snacks & Quick Bites">Snacks & Quick Bites</option>
                  <option value="Bakery & Desserts">Bakery & Desserts</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
