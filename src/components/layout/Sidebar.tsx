import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  Calendar,
  CreditCard,
  Shield,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Estructura de links de navegación basados en roles
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['admin', 'professor', 'student'],
    },
    {
      path: '/students',
      name: 'Estudiantes',
      icon: <Users size={18} />,
      roles: ['admin', 'professor'],
    },
    {
      path: '/professors',
      name: 'Profesores',
      icon: <GraduationCap size={18} />,
      roles: ['admin'],
    },
    {
      path: '/courses',
      name: 'Cursos',
      icon: <BookOpen size={18} />,
      roles: ['admin', 'professor', 'student'],
    },
    {
      path: '/enrollments',
      name: 'Matrículas',
      icon: <FileText size={18} />,
      roles: ['admin', 'student'],
    },
    {
      path: '/periods',
      name: 'Períodos',
      icon: <Calendar size={18} />,
      roles: ['admin'],
    },
    {
      path: '/grades',
      name: 'Calificaciones',
      icon: <Award size={18} />,
      roles: ['admin', 'professor', 'student'],
    },
    {
      path: '/payments',
      name: 'Pagos',
      icon: <CreditCard size={18} />,
      roles: ['admin', 'student'],
    },
    {
      path: '/users',
      name: 'Usuarios',
      icon: <UserCheck size={18} />,
      roles: ['admin'],
    },
    {
      path: '/roles',
      name: 'Roles',
      icon: <Shield size={18} />,
      roles: ['admin'],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role || ''));

  return (
    <aside className="w-64 bg-blue-50 text-slate-600 flex flex-col border-r border-blue-100">
      {/* Logotipo del Sistema */}
      <div className="p-6 border-b border-blue-100 flex items-center space-x-3">
        <div className="bg-navy-800 p-1.5 rounded-lg text-white">
          <Award size={20} />
        </div>
        <span className="font-bold text-base text-navy-800 tracking-wide">
          UniMatrícula
        </span>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-navy-800 text-white shadow-md shadow-navy-900/30'
                  : 'text-slate-600 hover:bg-blue-100/60 hover:text-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Pie de página del menú */}
      <div className="p-4 border-t border-blue-100 text-center text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
        SGA v1.0 &copy; 2026
      </div>
    </aside>
  );
};

export default Sidebar;
