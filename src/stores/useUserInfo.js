import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserInfo = create(
  persist(
    (set, get) => ({
      // ===== State (persisted) =====
      roles: null,
      accessToken: null,
      refreshToken: null,
      userDisplayName: null,

      // ===== State (runtime) =====
      hydrated: false,

      // ===== Actions =====
      setFromLoginResponse: (data) => {
        set({
          roles: data?.roles ?? null,
          accessToken: data?.token ?? null,
          refreshToken: data?.refreshToken ?? null,
          userDisplayName: data?.userDisplayName ?? null,
        });
      },

      clear: () => {
        set({
          roles: null,
          accessToken: null,
          refreshToken: null,
          userDisplayName: null,
        });
      },

      // ===== Helpers / selectors =====
      getUser: () => get().userDisplayName,
      getAccessToken: () => get().accessToken,
      isTokenExpired: async () => {
        const token = get().accessToken;
        if (!token) return true;
        // TODO: Add token expiration check logic
        return false;
      },
    }),
    {
      name: "user-auth", // key trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        roles: state?.roles ?? null,
        accessToken: state?.accessToken ?? null,
        refreshToken: state?.refreshToken ?? null,
        userDisplayName: state?.userDisplayName ?? null,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.set?.({ hydrated: true });
        const result = state?.isTokenExpired?.();
        if (result && typeof result.then === "function") {
          result.then((expired) => {
            if (expired) state?.clear?.();
          });
        } else if (result) {
          state?.clear?.();
        }
      },
    }
  )
);

export default useUserInfo;
