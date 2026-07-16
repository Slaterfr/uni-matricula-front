import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, User as UserIcon, AlertCircle, X, Check, XCircle } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  role_id: string;
  role_name: string;
  is_active: boolean;
}

interface RoleItem {
  id: string;
  name: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user: loggedInUser } = useAuth();
  const isAdmin = loggedInUser?.role === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err: any) {
      console.error('Error fetching users/roles:', err);
      setError('No se pudo cargar la información de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setEmail('');
    setPassword('');
    setRoleId(roles[0]?.id || '');
    setIsActive(true);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (userItem: UserItem) => {
    setEditingUser(userItem);
    setEmail(userItem.email);
    setPassword(''); // Dejar vacío para no sobreescribir la contraseña
    setRoleId(userItem.role_id);
    setIsActive(userItem.is_active);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !roleId) {
      setSubmitError('El correo electrónico y el rol son campos requeridos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      setSubmitError('Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).');
      return;
    }

    if (!editingUser && !password) {
      setSubmitError('La contraseña es requerida para nuevos usuarios.');
      return;
    }

    try {
      if (editingUser) {
        // Actualizar
        const payload: any = {
          email: cleanEmail,
          role_id: roleId,
          is_active: isActive,
        };
        if (password) payload.password = password; // Solo si se digita
        
        const response = await api.put(`/users/${editingUser.id}`, payload);
        setUsers(users.map((u) => u.id === editingUser.id ? response.data : u));
      } else {
        // Crear nuevo
        const response = await api.post('/users', {
          email: cleanEmail,
          password,
          role_id: roleId,
          is_active: isActive,
        });
        setUsers([...users, response.data]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving user:', err);
      const msg = err.response?.data?.detail || 'No se pudo guardar la cuenta del usuario.';
      setSubmitError(msg);
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (userEmail === loggedInUser?.email) {
      alert('No puedes eliminar tu propia cuenta en sesión.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la cuenta de "${userEmail}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const msg = err.response?.data?.detail || 'No se pudo eliminar la cuenta de usuario.';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Usuarios del Sistema</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra las cuentas globales y contraseñas de acceso al portal.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol Asignado</th>
                <th className="px-6 py-4">Estado de Acceso</th>
                {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center space-x-2.5">
                      <UserIcon size={16} className="text-slate-400" />
                      <span>{item.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize font-medium">
                    {item.role_name}
                  </td>
                  <td className="px-6 py-4">
                    {item.is_active ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <Check size={12} />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                        <XCircle size={12} />
                        <span>Inactivo</span>
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.email)}
                          disabled={item.email === loggedInUser?.email}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.email === loggedInUser?.email 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación / Edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUser ? 'Editar Cuenta de Usuario' : 'Crear Cuenta de Usuario'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@universidad.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Contraseña {editingUser && <span className="text-[10px] text-slate-400 capitalize font-normal">(Dejar en blanco para no modificar)</span>}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Contraseña de seguridad'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Rol del Usuario
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold capitalize"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
                <label htmlFor="isActiveCheck" className="text-sm font-semibold text-slate-700 select-none">
                  Cuenta habilitada (Activo)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
