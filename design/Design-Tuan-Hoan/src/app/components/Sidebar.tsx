import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  FolderOpen,
  CalendarRange,
  Calendar,
  Settings,
} from "lucide-react";

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/giao-dich", label: "Giao dịch", icon: Receipt },
  { to: "/tiet-kiem", label: "Tiết kiệm", icon: PiggyBank },
  { to: "/danh-muc", label: "Danh mục", icon: FolderOpen },
  { to: "/timeline", label: "Tuần hoàn chi tiêu", icon: Calendar },
  { to: "/tong-ket-nam", label: "Tổng Kết Năm", icon: CalendarRange },
];

export function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col justify-between py-6 px-4">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-indigo-600" style={{ fontSize: "14px", fontWeight: 600 }}>
              Ting Thu Chi
            </div>
            <div className="text-gray-400" style={{ fontSize: "11px" }}>
              Quản lý tài chính
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
              style={{ fontSize: "14px" }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 pt-4">
        <NavLink
          to="/cai-dat"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          style={{ fontSize: "14px" }}
        >
          <Settings className="w-[18px] h-[18px]" />
          Cài đặt
        </NavLink>
        <div className="text-gray-300 px-3 mt-2" style={{ fontSize: "11px" }}>
          v8.2.0
        </div>
      </div>
    </aside>
  );
}