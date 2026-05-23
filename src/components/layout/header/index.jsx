import { Header as BaseHeader } from "@/components/layout/index.jsx";
import { Bell, ChevronDown } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/dropdown-menu";
import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from "@/helpers/paths.js";
import BackupRestore from "@/components/features/BackupRestore";

const ModifiedHeader = () => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith('/ledger/')) return 'Lịch sử chi tiết vật tư';
    return 'Hệ thống Quản lý Kho';
  };

  return (
    <BaseHeader className="bg-white rounded-full px-4 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-10">
      {/* Page Title */}
      <h1 className="text-lg font-medium text-slate-800">{getPageTitle(location.pathname)}</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Backup / Restore buttons */}
        <BackupRestore />

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Currency Selector */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pr-3">
          <span className="text-xs text-slate-500 font-medium px-2">Currency</span>
          <Dropdown>
            <DropdownTrigger className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 focus:outline-none">
              <div className="flex items-center px-2 rounded-lg py-0.5 gap-2 bg-gray-200">
              VND <ChevronDown className="w-3 h-3" />
              </div>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem>VND</DropdownItem>
              <DropdownItem>USD</DropdownItem>
              <DropdownItem>EUR</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Notification */}
        <button className="relative p-2 text-slate-600 bg-gray-100 hover:bg-slate-200 cursor-pointer rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-slate-800 rounded-full border border-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-slate-100 rounded-full pr-4 py-0 cursor-pointer">
          <img
            src="https://i.pravatar.cc/150?u=alyssa"
            alt="Alyssa Wessex"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <span className="text-sm font-semibold text-slate-700">Alyssa Wessex</span>
        </div>
      </div>
    </BaseHeader>
  );
};

export default ModifiedHeader;
