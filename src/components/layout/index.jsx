import { cn } from "@/helpers/utils";

export const Header = ({ className, children }) => (
  <header
    className={cn(
      "bg-mode flex w-full justify-between box-border items-center shadow-sm",
      className
    )}
  >
    {children}
  </header>
);

export const Footer = ({ className, children }) => (
  <footer
    className={cn(
      "text-center box-border font-primary font-light text-caption",
      className
    )}
  >
    {children}
  </footer>
);

export const Sidebar = ({ className, children }) => (
  <aside className={cn("flex-none w-[150px] box-border bg-primary", className)}>
    {children}
  </aside>
);

export const Main = ({ className, children }) => (
  <div
    className={cn(
      "bg-transparent flex-1 overflow-auto w-full box-border relative",
      className
    )}
  >
    {children}
  </div>
);

const Layout = ({ className, header, sidebar, main, footer }) => (
  <div className={cn("h-screen w-screen overflow-hidden bg-slate-100 flex p-4 gap-4", className)}>
    {/* Sidebar Container */}
    <div className="h-full flex-none">
      {sidebar}
    </div>

    {/* Main Content Area (Header + Main) */}
    <div className="flex flex-col flex-1 h-full min-w-0 gap-4">
      {header}
      <div className="flex-1 relative min-h-0 overflow-hidden rounded-2xl flex flex-col">
        {main}
        {footer}
      </div>
    </div>
  </div>
);
export default Layout;
