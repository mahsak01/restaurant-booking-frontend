import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import './Layout.css';

interface MenuItem {
  path?: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    menu: true,
    'میزها': true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    { path: '/', label: 'داشبورد', icon: '📊' },
    { path: '/users', label: 'کاربران', icon: '👥' },
    {
      label: 'منو',
      icon: '🍽️',
      children: [
        { path: '/menus', label: 'لیست منوها', icon: '📋' },
        { path: '/categories', label: 'دسته‌بندی‌ها', icon: '📁' },
      ],
    },
    {
      label: 'میزها',
      icon: '🪑',
      children: [
        { path: '/tables', label: 'لیست میزها', icon: '🪑' },
        { path: '/reservations', label: 'رزرو میز', icon: '📅' },
      ],
    },
    { path: '/orders', label: 'سفارش‌ها', icon: '🛒' },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenu(item.label);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="layout-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>رستوران</h2>
          <button 
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={item.path || item.label || index} className="nav-item-wrapper">
              <button
                className={`nav-item ${item.children ? 'has-children' : ''} ${isParentActive(item) ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.children && (
                      <span className={`nav-arrow ${expandedMenus[item.label] ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    )}
                  </>
                )}
              </button>
              {item.children && sidebarOpen && expandedMenus[item.label] && (
                <div className="submenu">
                  {item.children.map((child) => (
                    <button
                      key={child.path}
                      className={`submenu-item ${isActive(child.path) ? 'active' : ''}`}
                      onClick={() => child.path && navigate(child.path)}
                    >
                      <span className="submenu-icon">{child.icon}</span>
                      <span className="submenu-label">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">خروج</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

