import { Main } from "@/components/layout/index.jsx";
import { Outlet } from "react-router";

const ModifiedMain = () => (
  <Main className="w-full flex-1 min-h-0">
    <Outlet />
  </Main>
);

export default ModifiedMain;
