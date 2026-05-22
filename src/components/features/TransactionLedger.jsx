import React, { useEffect, useState, useRef } from 'react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { exportToExcel, importFromExcel } from '@/helpers/excel';
import { 
  ClipboardList, Search, Download, Upload, X, Check, 
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, Calendar,
  ArrowDownLeft, ArrowUpRight, Trash2, Edit2, Info, ArrowLeft, Boxes, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const TransactionLedger = () => {
  const {
    materials, fetchMaterials, loadingMaterials,
    transactions, fetchTransactions, loadingTransactions,
    drivers, fetchDrivers,
    updateTransaction, deleteTransaction, importTransactions
  } = useWarehouseStore();

  const { materialId } = useParams();
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, NHAP, XUAT
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit Transaction Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    type: 'NHAP',
    material_id: '',
    quantity: 0,
    driver_id: '',
    odometer: '',
    notes: ''
  });
  const [editError, setEditError] = useState('');

  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchMaterials();
    fetchTransactions();
    fetchDrivers();
  }, [fetchMaterials, fetchTransactions, fetchDrivers]);

  // Find active material if materialId is present
  const activeMat = React.useMemo(() => {
    if (!materialId) return null;
    return materials.find(m => String(m.id) === String(materialId));
  }, [materials, materialId]);

  // Group transactions by material ID
  const txsByMaterial = React.useMemo(() => {
    const groups = {};
    transactions.forEach(tx => {
      const matId = tx.material_id;
      if (!groups[matId]) {
        groups[matId] = [];
      }
      groups[matId].push(tx);
    });
    return groups;
  }, [transactions]);

  // Filtered materials (for the general ledger view)
  const filteredMaterials = React.useMemo(() => {
    return materials.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || 
                          (m.code && m.code.toLowerCase().includes(q)) ||
                          (m.location && m.location.toLowerCase().includes(q));
      
      if (!matchSearch) return false;

      // Check if there's any transaction for this material matching type & date filters
      const txs = txsByMaterial[m.id] || [];
      if (filterType !== 'ALL' || startDate || endDate) {
        const hasMatchingTx = txs.some(tx => {
          const matchType = filterType === 'ALL' || tx.type === filterType;
          const matchStart = !startDate || tx.date >= startDate;
          const matchEnd = !endDate || tx.date <= endDate;
          return matchType && matchStart && matchEnd;
        });
        return hasMatchingTx;
      }

      return true;
    });
  }, [materials, searchQuery, txsByMaterial, filterType, startDate, endDate]);

  // Filtered transactions for the active material detail view
  const activeMaterialTransactions = React.useMemo(() => {
    if (!activeMat) return [];
    const rawTxs = txsByMaterial[activeMat.id] || [];
    
    // Sort transactions chronologically (newest first for display)
    const sortedTxs = [...rawTxs].reverse();
    
    return sortedTxs.filter(tx => {
      const matchType = filterType === 'ALL' || tx.type === filterType;
      const matchStart = !startDate || tx.date >= startDate;
      const matchEnd = !endDate || tx.date <= endDate;
      
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchSearch = (tx.driver_code && tx.driver_code.toLowerCase().includes(q)) ||
                      (tx.driver_name && tx.driver_name.toLowerCase().includes(q)) ||
                      (tx.driver_plate && tx.driver_plate.toLowerCase().includes(q)) ||
                      (tx.notes && tx.notes.toLowerCase().includes(q));
      }
      
      return matchType && matchStart && matchEnd && matchSearch;
    });
  }, [activeMat, txsByMaterial, filterType, startDate, endDate, searchQuery]);

  // Handle Export All Ledger
  const handleExportAll = () => {
    if (transactions.length === 0) {
      alert('Không có nhật ký giao dịch để xuất!');
      return;
    }

    const exportData = transactions.map((t, idx) => ({
      stt: idx + 1,
      date: t.date,
      type: t.type === 'NHAP' ? 'Nhập kho' : 'Xuất kho',
      material_code: t.material_code || '—',
      material_name: t.material_name,
      quantity: t.quantity,
      unit: t.material_unit || 'Cái',
      driver_code: t.driver_code || '—',
      driver_name: t.driver_name || '—',
      plate: t.driver_plate || '—',
      odometer: t.odometer || '—',
      notes: t.notes || ''
    }));

    const headers = [
      'STT', 'Ngày tháng', 'Phân loại', 'Mã vật tư', 'Tên vật tư',
      'Số lượng', 'ĐVT', 'Mã tài xế', 'Tên tài xế', 'Biển số xe', 'Số km lúc xuất', 'Ghi chú'
    ];
    
    const keys = [
      'stt', 'date', 'type', 'material_code', 'material_name',
      'quantity', 'unit', 'driver_code', 'driver_name', 'plate', 'odometer', 'notes'
    ];

    exportToExcel(exportData, headers, keys, 'so_kho_giao_dich_tong_hop.xlsx', 'Nhật ký chung');
  };

  // Handle Export for a single material
  const handleExportMaterial = (material) => {
    const txs = txsByMaterial[material.id] || [];
    if (txs.length === 0) {
      alert('Vật tư này chưa có nhật ký giao dịch để xuất!');
      return;
    }

    const exportData = [...txs].reverse().map((t, idx) => ({
      stt: idx + 1,
      date: t.date,
      nhap: t.type === 'NHAP' ? t.quantity : '',
      xuat: t.type === 'XUAT' ? t.quantity : '',
      driver_code: t.driver_code || '—',
      plate: t.driver_plate || '—',
      driver_name: t.driver_name || '—',
      odometer: t.odometer || '—',
      notes: t.notes || ''
    }));

    const headers = [
      'STT', 'Ngày tháng', 'Nhập (lượng)', 'Xuất (lượng)', 'Mã tài xế', 'Biển số xe', 'Tên tài xế', 'Số km', 'Ghi chú'
    ];
    const keys = [
      'stt', 'date', 'nhap', 'xuat', 'driver_code', 'plate', 'driver_name', 'odometer', 'notes'
    ];

    const fileName = `nhat_ky_${material.code || 'vt'}_${material.name.replace(/\s+/g, '_')}.xlsx`;
    exportToExcel(exportData, headers, keys, fileName, 'Nhật ký vật tư');
  };

  // Trigger file select dialog
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  // Parse and batch import transaction records
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Excel header aliases
    const columnMapping = {
      date: ['ngày', 'date', 'ngày tháng', 'ngay'],
      material_code_or_name: ['vật tư', 'tên vật tư', 'mã vt', 'mã vật tư', 'material', 'vat tu', 'tên vật tư tồn kho'],
      driver_code_or_name: ['tài xế', 'mã tx', 'mã tài xế', 'driver', 'tai xe', 'tài xế/người nhận', 'người nhận'],
      plate: ['xe', 'biển số', 'biển số xe', 'plate', 'bien so', 'phương tiện'],
      odometer: ['số km', 'odometer', 'so km', 'km', 'số km lúc xuất'],
      notes: ['ghi chú', 'notes', 'ghi chu', 'nội dung', 'noi dung'],
      unit: ['đvt', 'đơn vị tính', 'dvt', 'unit', 'đơn vị']
    };

    try {
      const rawData = await importFromExcel(file, columnMapping);
      if (rawData.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
        return;
      }

      // Check if file is Sheet 2 style (contains 'nhập (lít)' / 'xuất (lít)' rather than general quantity)
      const mappedData = rawData.map(row => {
        const keys = Object.keys(row);
        const getVal = (possibleHeaders) => {
          const key = keys.find(k => possibleHeaders.includes(k.toLowerCase().trim()));
          return key ? row[key] : null;
        };

        const dateVal = getVal(['ngày', 'date', 'ngày tháng', 'ngay']);
        let date = '';
        if (dateVal) {
          if (typeof dateVal === 'number') {
            const dateObj = new Date((dateVal - 25569) * 86400 * 1000);
            date = dateObj.toISOString().substring(0, 10);
          } else {
            date = dateVal.toString().substring(0, 10);
          }
        } else {
          date = new Date().toISOString().substring(0, 10);
        }

        let material = getVal(['vật tư', 'tên vật tư', 'mã vt', 'mã vật tư', 'material', 'vat tu', 'tên vật tư tồn kho']);
        const driver = getVal(['tài xế', 'mã tx', 'mã tài xế', 'driver', 'tai xe', 'tài xế/người nhận', 'người nhận']);
        const plate = getVal(['xe', 'biển số', 'biển số xe', 'plate', 'bien so', 'phương tiện']);
        const odometer = getVal(['số km', 'odometer', 'so km', 'km', 'số km lúc xuất']);
        const notes = getVal(['ghi chú', 'notes', 'ghi chu', 'nội dung', 'noi dung']);
        const unit = getVal(['đvt', 'đơn vị tính', 'dvt', 'unit', 'đơn vị']);

        let type = 'XUAT';
        let quantity = 0;

        const nhapVal = getVal(['nhập (lít)', 'nhập lít', 'nhap lit', 'nhập', 'nhap']);
        const xuatVal = getVal(['xuất (lít)', 'xuất lít', 'xuat lit', 'xuất', 'xuat']);
        const qtyVal = getVal(['số lượng', 'quantity', 'sl', 'qty']);

        if (nhapVal !== null && nhapVal !== undefined && parseFloat(nhapVal) > 0) {
          type = 'NHAP';
          quantity = parseFloat(nhapVal);
          if (!material) material = 'Ure (Lít)';
        } else if (xuatVal !== null && xuatVal !== undefined && parseFloat(xuatVal) > 0) {
          type = 'XUAT';
          quantity = parseFloat(xuatVal);
          if (!material) material = 'Ure (Lít)';
        } else if (qtyVal !== null && qtyVal !== undefined) {
          quantity = parseFloat(qtyVal);
          const purpose = getVal(['mục đích', 'loại', 'type', 'mục đích nhập/xuất', 'loai']);
          if (purpose && (purpose.toLowerCase().includes('nhập') || purpose.toLowerCase().includes('nhap') || purpose.toLowerCase().includes('in'))) {
            type = 'NHAP';
          } else {
            type = 'XUAT';
          }
        }

        return {
          date,
          type,
          material_code_or_name: material || 'Vật tư khác',
          quantity,
          driver_code_or_name: driver,
          plate,
          odometer: odometer ? parseFloat(odometer) : null,
          notes: notes || '',
          unit: unit || 'Cái'
        };
      }).filter(row => row.quantity > 0 && row.material_code_or_name);

      if (mappedData.length === 0) {
        alert('Không trích xuất được giao dịch hợp lệ. Vui lòng kiểm tra tiêu đề các cột.');
        return;
      }

      await importTransactions(mappedData);
    } catch (error) {
      alert('Lỗi đọc file Excel: ' + error.message);
    } finally {
      e.target.value = null;
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setEditFormData({
      date: tx.date,
      type: tx.type,
      material_id: tx.material_id,
      quantity: tx.quantity,
      driver_id: tx.driver_id || '',
      odometer: tx.odometer || '',
      notes: tx.notes || ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingTx(null);
    setEditError('');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save updated transaction
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.date) {
      setEditError('Vui lòng chọn ngày giao dịch');
      return;
    }
    if (parseFloat(editFormData.quantity) <= 0) {
      setEditError('Số lượng phải lớn hơn 0');
      return;
    }

    const success = await updateTransaction(editingTx.id, {
      ...editFormData,
      quantity: parseFloat(editFormData.quantity),
      odometer: editFormData.odometer ? parseFloat(editFormData.odometer) : null,
      driver_id: editFormData.driver_id || null
    });

    if (success) {
      handleCloseEdit();
    }
  };

  // Delete transaction
  const handleDeleteTx = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số lượng tồn kho sẽ tự động tính lại.')) {
      await deleteTransaction(id);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const renderEditModal = () => (
    <AnimatePresence>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEdit}
            className="absolute inset-0 bg-slate-900"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Sửa đổi thông tin giao dịch</h3>
              <button
                onClick={handleCloseEdit}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              {editError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày giao dịch</label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                    required
                  />
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại giao dịch</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="NHAP">NHẬP KHO</option>
                    <option value="XUAT">XUẤT KHO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số lượng</label>
                  <input
                    type="number"
                    name="quantity"
                    step="any"
                    value={editFormData.quantity}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                    required
                  />
                </div>

                {/* Odometer */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số km</label>
                  <input
                    type="number"
                    name="odometer"
                    value={editFormData.odometer}
                    onChange={handleEditInputChange}
                    placeholder="Không bắt buộc"
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Driver */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài xế phụ trách</label>
                <select
                  name="driver_id"
                  value={editFormData.driver_id}
                  onChange={handleEditInputChange}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                >
                  <option value="">Không phân bổ tài xế (Nhập bồn / Khác)</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name} ({d.plate || 'Không có xe'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú</label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden resize-none"
                  placeholder="Nhập thông tin ghi chú..."
                />
              </div>

              {/* Controls */}
              <div className="mt-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-500 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // If viewing details of a specific material
  if (activeMat) {
    return (
      <div className="flex flex-col gap-6 p-6 h-auto">
        {/* Back Link */}
        <div>
          <button 
            onClick={() => navigate('/ledger')}
            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Sổ kho
          </button>
        </div>

        {/* Material Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-800">{activeMat.name}</h2>
                {activeMat.code && (
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                    {activeMat.code}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Nơi lưu trữ: <span className="text-slate-600 font-semibold">{activeMat.location || 'Kho chung'}</span> | Đơn vị tính: <span className="text-slate-600 font-semibold">{activeMat.unit || 'Cái'}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleExportMaterial(activeMat)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 rounded-xl transition-all cursor-pointer shadow-xs w-full md:w-auto"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Xuất Excel Vật tư này
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-24">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tồn đầu kỳ</div>
            <div className="text-2xl font-black text-slate-700 mt-2">
              {activeMat.initial_quantity} <span className="text-sm font-semibold text-slate-400">{activeMat.unit}</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-24">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Tổng nhập
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              +{activeMat.total_in || 0} <span className="text-sm font-semibold text-slate-400">{activeMat.unit}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-24">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Tổng xuất
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              -{activeMat.total_out || 0} <span className="text-sm font-semibold text-slate-400">{activeMat.unit}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-24 text-white">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tồn kho hiện tại</div>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              {activeMat.current_quantity} <span className="text-sm font-semibold text-slate-500">{activeMat.unit}</span>
            </div>
          </div>
        </div>

        {/* Local Filter Toolbar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài xế, biển số xe, ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">Tất cả loại phiếu</option>
                <option value="NHAP">Phiếu Nhập (IN)</option>
                <option value="XUAT">Phiếu Xuất (OUT)</option>
              </select>
            </div>

            {/* Reset button */}
            <div className="flex items-center justify-end md:justify-start">
              {(searchQuery || filterType !== 'ALL' || startDate || endDate) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer py-2 px-3 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Date Filter Row */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-400 text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-slate-400" />
              Lọc theo thời gian:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
              />
              <span className="text-slate-400 text-xs">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Detailed Transactions List Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              Lịch sử chi tiết giao dịch ({activeMaterialTransactions.length} bản ghi)
            </h3>
          </div>

          {loadingTransactions ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Đang tải lịch sử giao dịch...
            </div>
          ) : activeMaterialTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
              <Info className="w-8 h-8 text-slate-300" />
              <span>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4">STT</th>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4">Loại phiếu</th>
                    <th className="px-6 py-4 text-right">Số lượng ({activeMat.unit})</th>
                    <th className="px-6 py-4">Tài xế</th>
                    <th className="px-6 py-4">Biển số</th>
                    <th className="px-6 py-4 text-right">Số km</th>
                    <th className="px-6 py-4 max-w-[240px]">Ghi chú</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeMaterialTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-medium font-mono text-xs">{idx + 1}</td>
                      <td className="px-6 py-4 font-mono font-medium">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                          tx.type === 'NHAP' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                        }`}>
                          {tx.type === 'NHAP' ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Nhập kho
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Xuất kho
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-base ${
                        tx.type === 'NHAP' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.type === 'NHAP' ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {tx.driver_name ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{tx.driver_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{tx.driver_code}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 font-semibold">{tx.driver_plate || '—'}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium">
                        {tx.odometer !== null && tx.odometer !== undefined ? `${tx.odometer.toLocaleString()} km` : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 break-words max-w-[240px] leading-relaxed">{tx.notes || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Sửa giao dịch"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa giao dịch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Transaction Modal */}
        {renderEditModal()}
      </div>
    );
  }

  // Otherwise, render general Ledger List view
  return (
    <div className="flex flex-col gap-6 p-6 h-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-emerald-600" />
            Sổ kho Vật tư
          </h2>
          <p className="text-slate-500 text-sm">Theo dõi chi tiết nhật ký giao dịch xuất nhập, group theo từng danh mục vật tư</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex-1 md:flex-none shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            Nhập Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <button
            onClick={handleExportAll}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex-1 md:flex-none shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Xuất Excel Tổng hợp
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vật tư, mã VT, vị trí kho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Tất cả giao dịch</option>
              <option value="NHAP">Nhập kho (Nhập)</option>
              <option value="XUAT">Xuất kho (Xuất)</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-center justify-end md:justify-start">
            {(searchQuery || filterType !== 'ALL' || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer py-2 px-3 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Collapsible Row */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50 text-sm text-slate-600">
          <span className="flex items-center gap-1.5 font-medium text-slate-500 text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-slate-400" />
            Khoảng thời gian:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            />
            <span className="text-slate-400 text-xs">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Accordion Ledger Grid */}
      <div className="flex flex-col gap-4">
        {loadingMaterials || loadingTransactions ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 flex items-center justify-center gap-2 text-slate-400 shadow-xs">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Đang tải dữ liệu sổ kho...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 gap-2 shadow-xs">
            <ClipboardList className="w-12 h-12 text-slate-200" />
            <span>Không tìm thấy vật tư nào có dữ liệu khớp bộ lọc</span>
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            return (
              <div 
                key={mat.id} 
                onClick={() => navigate(`/ledger/${mat.id}`)}
                className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5 cursor-pointer group"
              >
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{mat.name}</h4>
                        {mat.code && (
                          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {mat.code}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        ĐVT: <span className="text-slate-600 font-medium">{mat.unit || 'Cái'}</span> | Nơi lưu trữ: <span className="text-slate-600 font-medium">{mat.location || 'Kho chung'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges on Header */}
                  <div className="flex items-center gap-4 ml-auto md:ml-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Tồn đầu / Hiện tại</div>
                      <div className="font-semibold text-sm text-slate-700">
                        {mat.initial_quantity} / <span className="font-bold text-emerald-600">{mat.current_quantity}</span> {mat.unit}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded-lg flex items-center gap-0.5">
                        Nhập: +{mat.total_in || 0}
                      </span>
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-1 rounded-lg flex items-center gap-0.5">
                        Xuất: -{mat.total_out || 0}
                      </span>
                    </div>

                    <div className="text-slate-400 pl-2 group-hover:text-emerald-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Transaction Modal */}
      {renderEditModal()}
    </div>
  );
};

export default TransactionLedger;
