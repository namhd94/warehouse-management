import { useRef, useState } from 'react';
import { DatabaseBackup, UploadCloud, ShieldAlert, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BackupRestore — safe full-database backup and restore.
 *
 * Backup:  GET /api/backup → downloads a versioned JSON with exact IDs.
 * Restore: POST /api/restore → clears DB and re-inserts in dependency order
 *          (drivers → materials → transactions), preserving all IDs exactly.
 */
const BackupRestore = () => {
  const { backupData, restoreData } = useWarehouseStore();

  const fileInputRef   = useRef(null);
  const [loading, setLoading]     = useState(null);   // 'backup' | 'restore' | null
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewCounts, setPreviewCounts] = useState(null);

  // ── Backup ─────────────────────────────────────────────────────────────────
  const handleBackup = async () => {
    setLoading('backup');
    await backupData();
    setLoading(null);
  };

  // ── Restore — step 1: read & preview file ──────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (json.version !== 1) {
          alert('File backup không hợp lệ hoặc không đúng phiên bản (version 1).');
          return;
        }
        setPendingFile(json);
        setPreviewCounts(json.counts || {});
        setConfirmOpen(true);
      } catch {
        alert('File không đúng định dạng JSON. Vui lòng chọn file backup .json.');
      }
    };
    reader.readAsText(file);
  };

  // ── Restore — step 2: confirmed ────────────────────────────────────────────
  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    setLoading('restore');
    await restoreData(pendingFile);
    setPendingFile(null);
    setPreviewCounts(null);
    setLoading(null);
  };

  const handleCancelRestore = () => {
    setConfirmOpen(false);
    setPendingFile(null);
    setPreviewCounts(null);
  };

  return (
    <>
      {/* ── Action Buttons ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Backup button */}
        <button
          id="btn-backup-database"
          onClick={handleBackup}
          disabled={!!loading}
          title="Xuất toàn bộ dữ liệu ra file JSON để backup / chuyển hệ thống"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading === 'backup' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <DatabaseBackup className="w-3.5 h-3.5" />
          )}
          Backup
        </button>

        {/* Restore button */}
        <button
          id="btn-restore-database"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!loading}
          title="Khôi phục toàn bộ dữ liệu từ file backup JSON"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading === 'restore' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" />
          )}
          Restore
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* ── Confirm Restore Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.92,    opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Xác nhận Khôi phục dữ liệu</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Hành động này sẽ xóa toàn bộ dữ liệu hiện tại</p>
                  </div>
                </div>
                <button onClick={handleCancelRestore} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview counts */}
              {previewCounts && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dữ liệu sẽ được khôi phục</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{previewCounts.drivers ?? '?'}</span> tài xế
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{previewCounts.materials ?? '?'}</span> vật tư
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{previewCounts.transactions ?? '?'}</span> giao dịch
                    </span>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ Toàn bộ dữ liệu hiện tại (tài xế, vật tư, giao dịch) sẽ bị <strong>xóa vĩnh viễn</strong> và thay thế bằng dữ liệu từ file backup này.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelRestore}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmRestore}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all cursor-pointer"
                >
                  Xác nhận Khôi phục
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackupRestore;
