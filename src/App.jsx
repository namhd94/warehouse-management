import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LayoutWrapper from "./components/layout-wrapper";
import PATHs from "./helpers/paths";

// Lazy load pages
const NotFound = lazy(() => import("./views/not-found"));
const ExampleForms = lazy(() => import("./views/example/forms"));
const ExampleComponents = lazy(() => import("./views/example/components"));

// Warehouse pages
const DriverManagement = lazy(() => import("./components/features/DriverManagement"));
const MaterialManagement = lazy(() => import("./components/features/MaterialManagement"));
const TransactionLedger = lazy(() => import("./components/features/TransactionLedger"));
const TransactionForm = lazy(() => import("./components/features/TransactionForm"));

function App() {
  return (
    <Routes>
      {/* Protected Routes inside LayoutWrapper */}
      <Route element={<LayoutWrapper />}>
        {/* Redirect root to /transactions (Phiếu Nhập/Xuất) as it is the landing page */}
        <Route
          path={PATHs.MAIN}
          element={<Navigate to={PATHs.TRANSACTIONS} replace />}
        />

        {/* Warehouse management routes */}
        <Route
          path={PATHs.TRANSACTIONS}
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải biểu mẫu...</div>}>
              <TransactionForm />
            </Suspense>
          }
        />
        <Route
          path={PATHs.LEDGER}
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải sổ kho...</div>}>
              <TransactionLedger />
            </Suspense>
          }
        />
        <Route
          path="/ledger/:materialId"
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải chi tiết vật tư...</div>}>
              <TransactionLedger />
            </Suspense>
          }
        />
        <Route
          path={PATHs.MATERIALS}
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải danh mục vật tư...</div>}>
              <MaterialManagement />
            </Suspense>
          }
        />
        <Route
          path={PATHs.DRIVERS}
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải danh sách tài xế...</div>}>
              <DriverManagement />
            </Suspense>
          }
        />

        {/* Example Pages for UI development */}
        <Route
          path={PATHs.UI_COMPONENTS}
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ExampleComponents />
            </Suspense>
          }
        />
        <Route
          path={PATHs.UI_FORM}
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ExampleForms />
            </Suspense>
          }
        />

        {/* Catch all - show NotFound page */}
        <Route
          path="*"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

