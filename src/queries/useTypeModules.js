import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/helpers/api';
import queryKeys from '@/helpers/queryKeys';
import { API_ENDPOINTS } from '@/helpers/urls';
import { toast } from 'react-toastify';

// --- Fetch Functions ---

const fetchTypes = async () => {
  const response = await apiClient.get(API_ENDPOINTS.TYPES.LIST);
  return response.data;
};

const fetchTypeModules = async (typeId) => {
  if (!typeId) return { data: [], total: 0 };
  const response = await apiClient.get(API_ENDPOINTS.TYPES.MODULES(typeId));
  return response.data;
};

const fetchAllModules = async () => {
  const response = await apiClient.get(API_ENDPOINTS.MODULES.LIST);
  return response.data;
};

// --- Hooks ---

export const useTypes = () => {
  return useQuery({
    queryKey: queryKeys.type.list({}),
    queryFn: fetchTypes,
  });
};

export const useTypeModules = (typeId) => {
  return useQuery({
    queryKey: queryKeys.type.moduleList(typeId),
    queryFn: () => fetchTypeModules(typeId),
    enabled: !!typeId,
  });
};

export const useAllModules = () => {
  return useQuery({
    queryKey: queryKeys.module.list,
    queryFn: fetchAllModules,
  });
};

// --- Mutations ---

export const useDeleteTypeModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ typeId, moduleId }) => {
      await apiClient.delete(API_ENDPOINTS.TYPES.DELETE_MODULE(typeId, moduleId));
    },
    onSuccess: (_, { typeId }) => {
      toast.success('Module removed successfully');
      // Invalidate the modules list for this type
      queryClient.invalidateQueries(queryKeys.type.moduleList(typeId));
    },
    onError: (error) => {
      console.error('Failed to remove module:', error);
      // toast.error is handled in api interceptor usually, but we can add specific message if needed
    },
  });
};

export const useAddModulesToType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ typeId, modules }) => {
      // ASSUMPTION: The API to add modules is POST /api/types/{typeId}/modules
      // and it accepts an array of module objects or IDs. 
      // Based on common patterns, sending IDs is safer.
      // Adjust the payload structure as per actual backend requirement.
      // If the backend expects a list of IDs:
      const payload = { moduleIds: modules.map(m => m.id) };
      await apiClient.post(API_ENDPOINTS.TYPES.MODULES(typeId), payload);
    },
    onSuccess: (_, { typeId }) => {
      toast.success('Modules added successfully');
      queryClient.invalidateQueries(queryKeys.type.moduleList(typeId));
    },
    onError: (error) => {
      console.error('Failed to add modules:', error);
    },
  });
};
