import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  // Obtener iniciales del usuario
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0];
    if (parts.includes('.')) {
      const subparts = parts.split('.');
      return (subparts[0][0] + subparts[1][0]).toUpperCase();
    }
    return parts.substring(0, 2).toUpperCase();
  };

  // Obtener nombre amigable basado en el correo o rol
  const getFriendlyName = (email: string) => {
    if (!email) return 'Usuario';
    const name = email.split('@')[0];
    // Formatear nombre: "nombre.apellido" -> "Nombre Apellido"
    if (name.includes('.')) {
      return name
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const email = user?.email || '';
  const initials = getInitials(email);
  const friendlyName = getFriendlyName(email);
  const roleName = user?.role === 'admin' ? 'Administrador' : user?.role === 'professor' ? 'Profesor' : 'Estudiante';

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Hamburger Menu Button on Mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          title="Abrir Menú"
        >
          <Menu size={20} />
        </button>

        {/* Avatar circular */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm sm:text-lg shadow-inner flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-sm sm:text-lg font-bold leading-tight text-slate-900">
            Bienvenido, {friendlyName}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500">
            {roleName} | II Cuatrimestre 2026
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 sm:space-x-2 bg-white hover:bg-slate-50 text-slate-700 transition-colors duration-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 shadow-sm"
        >
          <LogOut size={15} />
          <span className="hidden xs:inline">Cerrar Sesión</span>
          <span className="xs:hidden">Cerrar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
