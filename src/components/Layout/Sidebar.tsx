import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle, 
  LogOut, 
  Settings,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', roles: ["EMPLOYEE","MANAGER","HR"] },
    { to: '/my-requests', icon: FileText, label: 'My Requests', roles: ['EMPLOYEE',"MANAGER","HR"] },
    { to: '/new-request', icon: Calendar, label: 'New Request', roles: ["EMPLOYEE","MANAGER","HR"] },
    { to: '/pending-approvals', icon: CheckCircle, label: 'Pending Approvals', roles: ["MANAGER"] },
    { to: '/hr-approvals', icon: CheckCircle, label: 'HR Approvals', roles: ["HR"] },
    { to: '/users', icon: Users, label: 'Users', roles: ["HR"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes( user.role)
  );

  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-10">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave System</h1>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">{user?.username} </p>
          <p className="text-xs text-blue-600">{user?.role}</p>
        </div>
      </div>

      <nav className="mt-6">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;