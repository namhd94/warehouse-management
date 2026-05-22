import { create } from 'zustand';
import { apiClient } from '@/helpers/api';
import { toast } from 'react-toastify';

export const useWarehouseStore = create((set, get) => ({
  // Drivers State
  drivers: [],
  loadingDrivers: false,
  fetchDrivers: async () => {
    set({ loadingDrivers: true });
    try {
      const response = await apiClient.get('/api/drivers');
      set({ drivers: response.data, loadingDrivers: false });
    } catch (error) {
      set({ loadingDrivers: false });
      console.error('Error fetching drivers:', error);
    }
  },
  createDriver: async (driver) => {
    try {
      const response = await apiClient.post('/api/drivers', driver);
      set((state) => ({ drivers: [...state.drivers, response.data] }));
      toast.success('Thêm tài xế thành công!');
      return true;
    } catch (error) {
      console.error('Error creating driver:', error);
      return false;
    }
  },
  updateDriver: async (id, driver) => {
    try {
      const response = await apiClient.put(`/api/drivers/${id}`, driver);
      set((state) => ({
        drivers: state.drivers.map((d) => (d.id === id ? response.data : d)),
      }));
      toast.success('Cập nhật tài xế thành công!');
      return true;
    } catch (error) {
      console.error('Error updating driver:', error);
      return false;
    }
  },
  deleteDriver: async (id) => {
    try {
      await apiClient.delete(`/api/drivers/${id}`);
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== id),
      }));
      toast.success('Xóa tài xế thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  },
  importDrivers: async (driversArray) => {
    try {
      const response = await apiClient.post('/api/drivers/batch', driversArray);
      set({ drivers: response.data.data });
      toast.success(`Nhập thành công ${driversArray.length} tài xế!`);
      return true;
    } catch (error) {
      console.error('Error importing drivers:', error);
      return false;
    }
  },

  // Materials State
  materials: [],
  loadingMaterials: false,
  fetchMaterials: async () => {
    set({ loadingMaterials: true });
    try {
      const response = await apiClient.get('/api/materials');
      set({ materials: response.data, loadingMaterials: false });
    } catch (error) {
      set({ loadingMaterials: false });
      console.error('Error fetching materials:', error);
    }
  },
  createMaterial: async (material) => {
    try {
      await apiClient.post('/api/materials', material);
      // Re-fetch to get dynamic calculation of stock correctly
      await get().fetchMaterials();
      toast.success('Thêm vật tư thành công!');
      return true;
    } catch (error) {
      console.error('Error creating material:', error);
      return false;
    }
  },
  updateMaterial: async (id, material) => {
    try {
      await apiClient.put(`/api/materials/${id}`, material);
      // Re-fetch to get dynamic calculation of stock correctly
      await get().fetchMaterials();
      toast.success('Cập nhật vật tư thành công!');
      return true;
    } catch (error) {
      console.error('Error updating material:', error);
      return false;
    }
  },
  deleteMaterial: async (id) => {
    try {
      await apiClient.delete(`/api/materials/${id}`);
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
      }));
      toast.success('Xóa vật tư thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      return false;
    }
  },
  importMaterials: async (materialsArray) => {
    try {
      const response = await apiClient.post('/api/materials/batch', materialsArray);
      set({ materials: response.data.data });
      toast.success(`Nhập thành công ${materialsArray.length} vật tư!`);
      return true;
    } catch (error) {
      console.error('Error importing materials:', error);
      return false;
    }
  },

  // Transactions State
  transactions: [],
  loadingTransactions: false,
  fetchTransactions: async () => {
    set({ loadingTransactions: true });
    try {
      const response = await apiClient.get('/api/transactions');
      set({ transactions: response.data, loadingTransactions: false });
    } catch (error) {
      set({ loadingTransactions: false });
      console.error('Error fetching transactions:', error);
    }
  },
  createTransaction: async (tx) => {
    try {
      const response = await apiClient.post('/api/transactions', tx);
      set((state) => ({ transactions: [response.data, ...state.transactions] }));
      // Also update materials since transactions affect current stock levels
      await get().fetchMaterials();
      toast.success('Thực hiện giao dịch thành công!');
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
  },
  updateTransaction: async (id, tx) => {
    try {
      const response = await apiClient.put(`/api/transactions/${id}`, tx);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? response.data : t)),
      }));
      // Also update materials since transactions affect current stock levels
      await get().fetchMaterials();
      toast.success('Cập nhật giao dịch thành công!');
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  },
  deleteTransaction: async (id) => {
    try {
      await apiClient.delete(`/api/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
      // Also update materials since transactions affect current stock levels
      await get().fetchMaterials();
      toast.success('Xóa giao dịch thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },
  importTransactions: async (txsArray) => {
    try {
      const response = await apiClient.post('/api/transactions/batch', txsArray);
      set({ transactions: response.data.data });
      // Re-fetch materials to get updated stock levels
      await get().fetchMaterials();
      toast.success(`Nhập thành công ${txsArray.length} nhật ký giao dịch!`);
      return true;
    } catch (error) {
      console.error('Error importing transactions:', error);
      return false;
    }
  },
}));
