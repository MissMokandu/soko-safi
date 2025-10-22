import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, BarChart3, Settings, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-20 h-full w-72 bg-white shadow-lg border-r border-gray-200">
      <nav className="p-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;