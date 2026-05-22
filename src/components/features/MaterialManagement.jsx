import React, { useEffect, useState, useRef } from 'react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { exportToExcel, importFromExcel } from '@/helpers/excel';
import { 
  Boxes, Plus, Search, Edit2, Trash2, Download, Upload, 
  X, Check, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaterialManagement = () => {
  const { 
    materials, loadingMaterials, fetchMaterials, 
    createMaterial, updateMaterial, deleteMaterial, importMaterials 
  } = useWarehouseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '', 
    unit: '', 
    location: '', 
    initial_quantity: 0,
    check_month: '' 
  });
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleOpenAdd = () => {
    setSelectedMaterial(null);
    setFormData({ 
      code: '', 
      name: '', 
      unit: 'Cái', 
      location: 'Kho chung', 
      initial_quantity: 0,
      check_month: new Date().toISOString().substring(0, 7) 
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setSelectedMaterial(material);
    setFormData({ 
      code: material.code || '', 
      name: material.name, 
      unit: material.unit || 'Cái', 
      location: material.location || 'Kho chung', 
      initial_quantity: material.initial_quantity || 0,
      check_month: material.check_month || new Date().toISOString().substring(0, 7) 
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
    setFormData({ code: '', name: '', unit: '', location: '', initial_quantity: 0, check_month: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập Tên vật tư');
      return;
    }

    let success;
    if (selectedMaterial) {
      success = await updateMaterial(selectedMaterial.id, formData);
    } else {
      success = await createMaterial(formData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      await deleteMaterial(id);
    }
  };

  const handleExport = () => {
    if (materials.length === 0) {
      alert('Không có dữ liệu vật tư để xuất!');
      return;
    }
    
    // Add sequential number (STT) for Excel export
    const exportData = materials.map((m, idx) => ({
      stt: idx + 1,
      check_month: m.check_month,
      code: m.code,
      name: m.name,
      unit: m.unit,
      initial_quantity: m.initial_quantity,
      total_in: m.total_in,
      total_out: m.total_out,
      current_quantity: m.current_quantity,
      location: m.location
    }));

    const headers = [
      'STT', 'Kiểm kê tháng', 'Mã VT', 'TÊN VẬT TƯ TỒN KHO', 
      'ĐVT', 'Tồn đầu kỳ', 'Tổng Nhập', 'Tổng Xuất', 'Tồn kho hiện tại', 'Nơi lưu trữ'
    ];
    const keys = [
      'stt', 'check_month', 'code', 'name', 
      'unit', 'initial_quantity', 'total_in', 'total_out', 'current_quantity', 'location'
    ];
    
    exportToExcel(exportData, headers, keys, 'ton_kho_vat_tu.xlsx', 'Tồn kho');
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const columnMapping = {
      code: ['mã vt', 'mã vật tư', 'ma vt', 'ma vat tu', 'code'],
      name: ['tên vật tư', 'tên vật tư tồn kho', 'ten vat tu', 'name', 'tên', 'ten'],
      unit: ['đvt', 'đơn vị tính', 'don vi tinh', 'dvt', 'đơn vị', 'don vi', 'unit'],
      location: ['nơi lưu trữ', 'noi luu tru', 'vị trí', 'vi tri', 'location'],
      initial_quantity: ['số lượng', 'sl', 'sl ban đầu', 'tồn đầu', 'so luong', 'initial_quantity', 'qty'],
      check_month: ['kiểm kê tháng', 'tháng', 'kiem ke thang', 'thang', 'month']
    };

    try {
      const data = await importFromExcel(file, columnMapping);
      if (data.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra các cột.');
        return;
      }
      await importMaterials(data);
    } catch (error) {
      alert('Lỗi đọc file Excel: ' + error.message);
    } finally {
      e.target.value = null;
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.code && m.code.toLowerCase().includes(q)) ||
      (m.location && m.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 p-6 h-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-emerald-600" />
            Vật tư Tồn kho
          </h2>
          <p className="text-slate-500 text-sm">Quản lý danh mục vật tư, số lượng tồn kho đầu kỳ và nơi lưu trữ</p>
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
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex-1 md:flex-none shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Xuất Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-500 rounded-xl hover:opacity-90 transition-all cursor-pointer flex-1 md:flex-none shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Thêm vật tư
          </button>
        </div>
      </div>

      {/* Main Card with Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vật tư, mã VT, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Hiển thị {filteredMaterials.length} / {materials.length} vật tư
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {loadingMaterials ? (
            <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Đang tải danh sách vật tư...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
              <Boxes className="w-12 h-12 text-slate-200" />
              <span>Không tìm thấy vật tư nào</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">STT</th>
                  <th className="px-6 py-4">Mã VT</th>
                  <th className="px-6 py-4">Tên Vật Tư</th>
                  <th className="px-6 py-4">ĐVT</th>
                  <th className="px-6 py-4">Tồn Đầu Kỳ</th>
                  <th className="px-6 py-4 text-emerald-600">Tổng Nhập</th>
                  <th className="px-6 py-4 text-amber-600">Tổng Xuất</th>
                  <th className="px-6 py-4 font-bold text-slate-800">Tồn Hiện Tại</th>
                  <th className="px-6 py-4">Nơi lưu trữ</th>
                  <th className="px-6 py-4">Tháng KK</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredMaterials.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">{m.code || '—'}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{m.name}</td>
                    <td className="px-6 py-4">{m.unit}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{m.initial_quantity}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">+{m.total_in}</td>
                    <td className="px-6 py-4 font-semibold text-amber-600">-{m.total_out}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 bg-slate-50/50">{m.current_quantity}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {m.location || 'Kho chung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{m.check_month || '—'}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">
                  {selectedMaterial ? 'Cập nhật thông tin vật tư' : 'Thêm vật tư mới'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                {errorMsg && (
                  <div className="p-3 text-xs bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mã vật tư (Mã VT) <span className="text-slate-400 font-normal">(Tự động tạo nếu để trống)</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: VT-URE"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tên vật tư tồn kho <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Ure (Lít)"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Đơn vị tính (ĐVT)
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Cái, Lít, Bình"
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tháng kiểm kê
                    </label>
                    <input
                      type="text"
                      name="check_month"
                      value={formData.check_month}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 2026-05"
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tồn đầu kỳ
                    </label>
                    <input
                      type="number"
                      name="initial_quantity"
                      step="any"
                      value={formData.initial_quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nơi lưu trữ
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Kho phụ tùng"
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-500 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Lưu lại
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialManagement;
