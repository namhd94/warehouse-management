import { Link, useLocation } from "react-router-dom";
import { cn } from "@/helpers/utils";
import { getMenuItems } from "./paths";
import { ChevronDown, ChevronLeft, ChevronRight, Boxes } from "lucide-react";
import { useState } from "react";

const SidebarItem = ({ item, isActive, onClick, isCollapsed, onExpand }) => {
  const Icon = item.icon;

  if (item.children) {
    if (isCollapsed) {
      return (
        <button
          onClick={onExpand}
          className={cn(
            "flex items-center justify-center p-3 w-full transition-colors rounded-xl",
            "text-slate-300 hover:text-white hover:bg-white/10",
          )}
          title={item.label}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium transition-colors rounded-xl",
            "text-slate-300 hover:text-white hover:bg-white/10",
          )}
        >
          {Icon && <Icon className="w-6 h-6" />}
          <span className="flex-1 text-base">{item.label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              item.isOpen ? "rotate-180" : "",
            )}
          />
        </button>
        {item.isOpen && (
          <div className="flex flex-col gap-1 pl-4 mt-1 relative">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.label}
                  to={child.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all relative z-10",
                    child.path === location.pathname
                      ? "bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {ChildIcon && <ChildIcon className="w-4 h-4" />}
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <Link
        to={item.path}
        className={cn(
          "flex items-center justify-center p-3 w-full transition-colors rounded-xl",
          isActive
            ? "bg-emerald-600 text-white"
            : "text-slate-300 hover:text-white hover:bg-white/10",
        )}
        title={item.label}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors rounded-xl",
        isActive
          ? "bg-emerald-600 text-white"
          : "text-slate-300 hover:text-white hover:bg-white/10",
      )}
    >
      {Icon && <Icon className="w-6 h-6" />}
      {item.label}
    </Link>
  );
};

const Sidebar = ({ className }) => {
  const location = useLocation();
  const [items, setItems] = useState(getMenuItems());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleItem = (label) => {
    setItems(
      items.map((item) =>
        item.label === label ? { ...item, isOpen: !item.isOpen } : item,
      ),
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 border border-slate-800 text-white px-2 md:px-4 py-4 h-full rounded-2xl transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-[60px] md:w-[75px]" : "w-[230px]",
        className,
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 z-20 flex items-center justify-center w-6 h-6 cursor-pointer bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-full shadow-slate-700 shadow-md border-smd border-slate-200 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo Area */}
      <div
        className={cn(
          "flex items-center justify-center gap-1 mb-6 transition-all duration-300",
          isCollapsed ? "px-2 justify-center" : "px-4",
        )}
      >
        <Boxes className="w-8 h-8 text-emerald-500 shrink-0" />
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap ml-1.5">
            <span className="text-lg font-bold leading-none bg-linear-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Quản lý Kho
            </span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">
              Hệ thống Vật tư
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            isActive={
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path)) ||
              (item.children &&
                item.children.some((c) => c.path === location.pathname || (c.path !== '/' && location.pathname.startsWith(c.path))))
            }
            onClick={() => toggleItem(item.label)}
            isCollapsed={isCollapsed}
            onExpand={() => {
              setIsCollapsed(false);
              // Optional: Open the item as well if needed
              if (!item.isOpen) toggleItem(item.label);
            }}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
