export const API_BASE_URL = "http://localhost:8080";
const API_ROOT_PATH = "/api";
const API_PREFIX = "";

// API Endpoints
export const API_ENDPOINTS = {
  TYPES: {
    LIST: `${API_ROOT_PATH}${API_PREFIX}/types`,
    MODULES: (typeId) => `${API_ROOT_PATH}${API_PREFIX}/types/${typeId}/modules`,
    DELETE_MODULE: (typeId, moduleId) => `${API_ROOT_PATH}${API_PREFIX}/types/${typeId}/modules/${moduleId}`,
  },
  MODULES: {
    LIST: `${API_ROOT_PATH}${API_PREFIX}/modules`,
  },
};
