import React, { useState, useEffect, useRef } from 'react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { 
  Plus, ArrowDownLeft, ArrowUpRight, Check, AlertTriangle, 
  RefreshCw, Users, Boxes, Calendar, FileText, Info, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionForm = () => {
  const {
    materials, fetchMaterials,
    drivers, fetchDrivers,
    createTransaction
  } = useWarehouseStore();

  // Form State
  const [type, setType] = useState('XUAT'); // Default to Xuất (Export) as it's the most common daily task
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  
  // Material Selection state
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  
  // Driver Selection state
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  // Other Fields
  const [quantity, setQuantity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Autocomplete highlight indices
  const [materialActiveIndex, setMaterialActiveIndex] = useState(0);
  const [driverActiveIndex, setDriverActiveIndex] = useState(0);

  // Refs for closing dropdowns when clicking outside
  const materialRef = useRef(null);
  const driverRef = useRef(null);

  // Load initial store data
  useEffect(() => {
    fetchMaterials();
    fetchDrivers();
  }, [fetchMaterials, fetchDrivers]);

  // Click outside to close autocompletes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (materialRef.current && !materialRef.current.contains(event.target)) {
        setShowMaterialDropdown(false);
      }
      if (driverRef.current && !driverRef.current.contains(event.target)) {
        setShowDriverDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Materials for suggestions
  const filteredMaterials = React.useMemo(() => {
    if (!materialSearch.trim()) return [];
    const q = materialSearch.toLowerCase();
    return materials.filter(m => 
      (m.code && m.code.toLowerCase().includes(q)) || 
      m.name.toLowerCase().includes(q)
    );
  }, [materials, materialSearch]);

  // Filter Drivers for suggestions
  const filteredDrivers = React.useMemo(() => {
    if (!driverSearch.trim()) return [];
    const q = driverSearch.toLowerCase();
    return drivers.filter(d => 
      d.code.toLowerCase().includes(q) || 
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.plate && d.plate.toLowerCase().includes(q))
    );
  }, [drivers, driverSearch]);



  // Select handlers
  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
    setMaterialSearch(material.code || material.name);
    setShowMaterialDropdown(false);
    setErrorMsg('');
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverSearch(driver.code);
    setShowDriverDropdown(false);
    setErrorMsg('');
  };

  // Keyboard navigation for Materials autocomplete
  const handleMaterialKeyDown = (e) => {
    if (!showMaterialDropdown || filteredMaterials.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMaterialActiveIndex(prev => (prev + 1) % filteredMaterials.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMaterialActiveIndex(prev => (prev - 1 + filteredMaterials.length) % filteredMaterials.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectMaterial(filteredMaterials[materialActiveIndex]);
    } else if (e.key === 'Escape') {
      setShowMaterialDropdown(false);
    }
  };

  // Keyboard navigation for Drivers autocomplete
  const handleDriverKeyDown = (e) => {
    if (!showDriverDropdown || filteredDrivers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDriverActiveIndex(prev => (prev + 1) % filteredDrivers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDriverActiveIndex(prev => (prev - 1 + filteredDrivers.length) % filteredDrivers.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectDriver(filteredDrivers[driverActiveIndex]);
    } else if (e.key === 'Escape') {
      setShowDriverDropdown(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMaterial) {
      setErrorMsg('Vui lòng chọn hoặc nhập mã vật tư chính xác');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setErrorMsg('Số lượng phải lớn hơn 0');
      return;
    }

    // Additional validations
    if (type === 'XUAT') {
      // Alert/Warn but allow if user accepts, or strictly limit if required
      if (parseFloat(quantity) > selectedMaterial.current_quantity) {
        const confirmOverdraw = window.confirm(
          `Cảnh báo: Số lượng xuất (${quantity} ${selectedMaterial.unit || 'cái'}) vượt quá tồn kho hiện tại (${selectedMaterial.current_quantity} ${selectedMaterial.unit || 'cái'}). Bạn vẫn muốn tiếp tục?`
        );
        if (!confirmOverdraw) return;
      }
    }

    setSubmitting(true);

    const payload = {
      date,
      type,
      material_id: selectedMaterial.id,
      quantity: parseFloat(quantity),
      driver_id: selectedDriver ? selectedDriver.id : null,
      odometer: odometer ? parseFloat(odometer) : null,
      notes: notes.trim()
    };

    const success = await createTransaction(payload);
    setSubmitting(false);

    if (success) {
      // Clear specific form elements but keep common ones like Date & Type
      setMaterialSearch('');
      setSelectedMaterial(null);
      setDriverSearch('');
      setSelectedDriver(null);
      setQuantity('');
      setOdometer('');
      setNotes('');
      
      // Re-fetch materials to get updated stock levels in our suggestions cache
      fetchMaterials();
    }
  };

  const handleClear = () => {
    if (window.confirm('Xác nhận xóa trắng toàn bộ form nhập?')) {
      setMaterialSearch('');
      setSelectedMaterial(null);
      setDriverSearch('');
      setSelectedDriver(null);
      setQuantity('');
      setOdometer('');
      setNotes('');
      setErrorMsg('');
    }
  };

  // Live Inventory Status details
  const isOutOfStockWarning = type === 'XUAT' && selectedMaterial && parseFloat(quantity) > selectedMaterial.current_quantity;

  return (
    <div className="flex flex-col gap-6 p-6 h-auto max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-7 h-7 text-emerald-600" />
          Phiếu Nhập / Xuất Kho
        </h2>
        <p className="text-slate-500 text-sm">Ghi nhận giao dịch xuất nhập kho vật tư - Hỗ trợ tra cứu nhanh dữ liệu tài xế & vật tư</p>
      </div>

      {/* Form Container Card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-md overflow-hidden">
        {/* Toggle Nhập / Xuất Tab */}
        <div className="grid grid-cols-2 bg-slate-50 p-2 gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setType('NHAP');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              type === 'NHAP'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowDownLeft className={`w-5 h-5 ${type === 'NHAP' ? 'text-emerald-600' : ''}`} />
            NHẬP KHO (IN)
          </button>
          
          <button
            type="button"
            onClick={() => {
              setType('XUAT');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              type === 'XUAT'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowUpRight className={`w-5 h-5 ${type === 'XUAT' ? 'text-emerald-600' : ''}`} />
            XUẤT KHO (OUT)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-start gap-2.5"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lỗi nhập liệu:</span> {errorMsg}
              </div>
            </motion.div>
          )}

          {/* Section 1: Date & Basic Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-slate-800 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all"
                required
              />
            </div>

            {/* Empty column helper for responsive layout balance */}
            <div className="hidden md:block" />
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Material Selection (Autocomplete) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search Material Column */}
            <div className="md:col-span-6 flex flex-col gap-2 relative" ref={materialRef}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-slate-400" />
                Vật tư (Mã VT hoặc Tên)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã hoặc tên vật tư để tìm..."
                  value={materialSearch}
                  onFocus={() => {
                    setShowMaterialDropdown(true);
                    setMaterialActiveIndex(0);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaterialSearch(val);
                    setSelectedMaterial(null);
                    setShowMaterialDropdown(true);
                    setMaterialActiveIndex(0);
                    if (val.trim()) {
                      const match = materials.find(m => m.code && m.code.toLowerCase() === val.trim().toLowerCase());
                      if (match) {
                        setSelectedMaterial(match);
                      }
                    }
                  }}
                  onKeyDown={handleMaterialKeyDown}
                  className={`w-full px-4 py-3 text-slate-800 border rounded-2xl focus:outline-hidden focus:ring-1 transition-all ${
                    selectedMaterial 
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500 bg-emerald-50/10 font-semibold' 
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  required
                />
                {selectedMaterial && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-emerald-500 text-white rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showMaterialDropdown && filteredMaterials.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-xl divide-y divide-slate-50"
                  >
                    {filteredMaterials.map((m, idx) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMaterial(m)}
                        onMouseEnter={() => setMaterialActiveIndex(idx)}
                        className={`px-4 py-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          idx === materialActiveIndex ? 'bg-emerald-50/50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold font-mono text-emerald-700 mr-2 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            {m.code || 'KHÔNG MÃ'}
                          </span>
                          <span className="font-medium">{m.name}</span>
                        </div>
                        <div className="text-slate-400 font-semibold">
                          Tồn: {m.current_quantity} {m.unit || 'Cái'}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Read-Only Auto-Populated VLOOKUP columns */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn vị tính</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 font-mono">
                  {selectedMaterial ? selectedMaterial.unit || '—' : '—'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tồn kho hiện tại</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700">
                  {selectedMaterial ? `${selectedMaterial.current_quantity} ${selectedMaterial.unit || ''}` : '—'}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Driver Selection (Autocomplete) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search Driver Column */}
            <div className="md:col-span-6 flex flex-col gap-2 relative" ref={driverRef}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Tài xế nhận hàng (Mã TX, Tên hoặc Biển số)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã tài xế, tên hoặc xe..."
                  value={driverSearch}
                  onFocus={() => {
                    setShowDriverDropdown(true);
                    setDriverActiveIndex(0);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDriverSearch(val);
                    setSelectedDriver(null);
                    setShowDriverDropdown(true);
                    setDriverActiveIndex(0);
                    if (val.trim()) {
                      const match = drivers.find(d => d.code && d.code.toLowerCase() === val.trim().toLowerCase());
                      if (match) {
                        setSelectedDriver(match);
                      }
                    }
                  }}
                  onKeyDown={handleDriverKeyDown}
                  className={`w-full px-4 py-3 text-slate-800 border rounded-2xl focus:outline-hidden focus:ring-1 transition-all ${
                    selectedDriver 
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500 bg-emerald-50/10 font-semibold' 
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  required={type === 'XUAT'} // Required for exports to drivers
                />
                {selectedDriver && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-emerald-500 text-white rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showDriverDropdown && filteredDrivers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-xl divide-y divide-slate-50"
                  >
                    {filteredDrivers.map((d, idx) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDriver(d)}
                        onMouseEnter={() => setDriverActiveIndex(idx)}
                        className={`px-4 py-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          idx === driverActiveIndex ? 'bg-emerald-50/50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold font-mono text-emerald-700 mr-2 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            {d.code}
                          </span>
                          <span className="font-medium">{d.name}</span>
                        </div>
                        <div className="text-slate-400 font-mono font-semibold">
                          Xe: {d.plate || '—'}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Read-Only Auto-Populated VLOOKUP columns */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tài xế</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600">
                  {selectedDriver ? selectedDriver.name || '—' : '—'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  Biển số xe
                </label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 font-mono">
                  {selectedDriver ? selectedDriver.plate || '—' : '—'}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Quantities, Odometer & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Số lượng {selectedMaterial ? `(${selectedMaterial.unit})` : ''}
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-4 py-3 text-slate-800 border rounded-2xl focus:outline-hidden focus:ring-1 transition-all ${
                  isOutOfStockWarning 
                    ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-400 bg-amber-50/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                required
              />
              
              {/* Overdraw Warning */}
              {isOutOfStockWarning && (
                <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Vượt tồn kho hiện tại ({selectedMaterial.current_quantity})
                </div>
              )}
            </div>

            {/* Odometer */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Số km lúc xuất {type === 'NHAP' ? '(Không bắt buộc)' : ''}
              </label>
              <input
                type="number"
                placeholder="Nhập số km..."
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full px-4 py-3 text-slate-800 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all"
                required={type === 'XUAT'} // Required for material releases to trucks
              />
            </div>

            {/* Helper Info Pane */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-xs text-slate-500 items-start">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-700">Hướng dẫn nhanh</span>
                <span>
                  {type === 'NHAP' 
                    ? 'Nhập kho giúp gia tăng tồn kho vật tư được chọn. Số km và Tài xế là không bắt buộc.' 
                    : 'Xuất kho yêu cầu Tài xế và Số km tương ứng để giám sát hành trình giao xe/nhiên liệu.'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú giao dịch</label>
            <textarea
              placeholder="Nhập thêm ghi chú (Ví dụ: Nhập bồn Dầu URE, tài xế nhận phụ tùng...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 text-slate-800 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
            >
              Xóa trắng Form
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-linear-to-r from-emerald-600 to-teal-500 rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer min-w-44 shadow-md shadow-emerald-500/5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Ghi nhận phiếu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
