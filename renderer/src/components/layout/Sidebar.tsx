import { Link, NavLink } from "react-router-dom";
import { Icon } from "../ui/core/Icons";
import { ContextLogo } from "../ui/core/ContextLogo";
import { useAppSelector } from "../../store/hooks";

export const Sidebar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  if (isAdmin) return null;

  const navItems = [
    { label: "Workspace", path: "/workspace", icon: "space_dashboard" },
    { label: "Library", path: "/library", icon: "folder_open" },
    { label: "Comparison", path: "/compare", icon: "compare_arrows" },
    { label: "Settings", path: "/settings", icon: "settings" },
  ];

  return (
    <aside className="w-20 h-screen bg-light-surface dark:bg-[#121214] border-r border-light-border dark:border-white/5 flex flex-col items-center shrink-0 transition-colors z-50">
      {/* Logo Area */}
      <div className="h-20 w-full flex items-center justify-center border-b border-light-border dark:border-white/5">
        <Link
          to={isAdmin ? "/admin" : "/workspace"}
          onClick={(e) => {
            if (window.location.pathname === (isAdmin ? "/admin" : "/workspace")) {
              e.preventDefault();
              window.location.reload();
            }
          }}
          className="group focus:outline-none"
          aria-label="Refresh Context"
          title="Home"
        >
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-light-primary/20 dark:bg-dark-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface/80 border border-light-border dark:border-white/10 rounded-xl flex items-center justify-center shadow-sm z-10 overflow-hidden group-hover:border-light-primary/50 dark:group-hover:border-dark-primary/50 transition-colors">
              <ContextLogo />
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links (Labeled Rail) */}
      <nav className="flex-1 w-full py-6 flex flex-col items-center gap-4 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            id={`tour-sidebar-${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-[72px] py-2 rounded-2xl transition-all group ${
                isActive
                  ? "bg-light-primary/10 dark:bg-dark-primary/15 text-light-primary dark:text-dark-primary shadow-sm"
                  : "text-light-text/70 dark:text-white/60 hover:bg-light-bg dark:hover:bg-white/10 hover:text-light-text dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  filled={isActive}
                  className="text-[24px] mb-1"
                />
                <span className="text-[10px] font-semibold tracking-wide text-center w-full">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
