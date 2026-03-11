import { NavLink, useLocation } from "react-router-dom";
import { Users, Stethoscope, Calendar, Receipt, LayoutDashboard, Activity } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Patients" },
  { to: "/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/appointments", icon: Calendar, label: "Appointments" },
  { to: "/billing", icon: Receipt, label: "Billing" },
];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏥</div>
          <div>
            <div className="logo-text">MediCore</div>
            <div className="logo-sub">Hospital System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item${isActive ? " active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="hospital-info">
          <strong>MediCore General</strong>
          <span>123 Health Ave, Medical District</span>
        </div>
      </div>
    </aside>
  );
}
