import React, { useEffect, useState, useRef } from 'react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { exportToExcel, importFromExcel } from '@/helpers/excel';
import { 
  Users, Plus, Search, Edit2, Trash2, Download, Upload, 
  X, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverManagement = () => {
  const { 
    drivers, loadingDrivers, fetchDrivers, 
    createDriver, updateDriver, deleteDriver, importDrivers 
  } = useWarehouseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', plate: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleOpenAdd = () => {
    setSelectedDriver(null);
    setFormData({ code: '', name: '', plate: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({ code: driver.code, name: driver.name || '', plate: driver.plate || '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
    setFormData({ code: '', name: '', plate: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setErrorMsg('Vui lòng nhập Mã tài xế');
      return;
    }

    let success;
    if (selectedDriver) {
      success = await updateDriver(selectedDriver.id, formData);
    } else {
      success = await createDriver(formData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
      await deleteDriver(id);
    }
  };

  const handleExport = () => {
    if (drivers.length === 0) {
      alert('Không có dữ liệu tài xế để xuất!');
      return;
    }
    const headers = ['Mã TX', 'Tên TX', 'Biển số xe'];
    const keys = ['code', 'name', 'plate'];
    exportToExcel(drivers, headers, keys, 'danh_sach_tai_xe.xlsx', 'Tài xế');
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const columnMapping = {
      code: ['mã tx', 'mã tài xế', 'ma tx', 'ma tai xe', 'code'],
      plate: ['biển số', 'xe', 'biển số xe', 'bien so', 'plate'],
      name: ['tên tx', 'tên tài xế', 'ten tx', 'ten tai xe', 'name', 'tài xế', 'tai xe']
    };

    try {
      const data = await importFromExcel(file, columnMapping);
      if (data.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra các cột.');
        return;
      }
      await importDrivers(data);
    } catch (error) {
      alert('Lỗi đọc file Excel: ' + error.message);
    } finally {
      // Reset input file value to allow importing the same file again
      e.target.value = null;
    }
  };

  // Filtered drivers based on query
  const filteredDrivers = drivers.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.code.toLowerCase().includes(q) ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.plate && d.plate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 p-6 h-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Quản lý Tài xế
          </h2>
          <p className="text-slate-500 text-sm">Quản lý thông tin tài xế và biển số xe vận hành kho</p>
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
            Thêm tài xế
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
              placeholder="Tìm kiếm tài xế, biển số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Hiển thị {filteredDrivers.length} / {drivers.length} tài xế
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {loadingDrivers ? (
            <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Đang tải dữ liệu tài xế...
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
              <Users className="w-12 h-12 text-slate-200" />
              <span>Không tìm thấy tài xế nào</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Mã tài xế (Mã TX)</th>
                  <th className="px-6 py-4">Tên tài xế (Tên TX)</th>
                  <th className="px-6 py-4">Biển số xe</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-emerald-700">{driver.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{driver.name || '—'}</td>
                    <td className="px-6 py-4 font-mono">{driver.plate || '—'}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(driver)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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
                  {selectedDriver ? 'Cập nhật thông tin tài xế' : 'Thêm tài xế mới'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                {errorMsg && (
                  <div className="p-3 text-xs bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mã tài xế (Mã TX) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    disabled={!!selectedDriver}
                    placeholder="Ví dụ: TX01"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tên tài xế (Tên TX)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Biển số xe
                  </label>
                  <input
                    type="text"
                    name="plate"
                    value={formData.plate}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 50H-12345"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-3">
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

export default DriverManagement;
