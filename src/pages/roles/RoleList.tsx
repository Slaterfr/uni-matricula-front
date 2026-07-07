import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Shield, AlertCircle, X } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
}

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError('No se pudo cargar la lista de roles del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || '');
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('El nombre del rol es requerido.');
      return;
    }

    try {
      if (editingRole) {
        // Actualizar
        const response = await api.put(`/roles/${editingRole.id}`, {
          name: name.trim().toLowerCase(),
          description: description.trim(),
        });
        setRoles(roles.map((r) => r.id === editingRole.id ? response.data : r));
      } else {
        // Crear nuevo
        const response = await api.post('/roles', {
          name: name.trim().toLowerCase(),
          description: description.trim(),
        });
        setRoles([...roles, response.data]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving role:', err);
      const msg = err.response?.data?.detail || 'No se pudo guardar el rol en el sistema.';
      setSubmitError(msg);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (['admin', 'professor', 'student'].includes(roleName)) {
      alert('No se pueden eliminar los roles básicos del sistema.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el rol "${roleName}"?`)) {
      return;
    }

    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting role:', err);
      const msg = err.response?.data?.detail || 'No se pudo eliminar el rol.';
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
          <h2 className="text-xl font-bold text-slate-900">Gestión de Roles</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra los roles y perfiles de acceso autorizados en el sistema.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Rol</span>
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
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Descripción</th>
                {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {roles.map((role) => {
                const isBasic = ['admin', 'professor', 'student'].includes(role.name);
                return (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center space-x-1.5 capitalize">
                        <Shield size={14} className={isBasic ? 'text-blue-500' : 'text-slate-400'} />
                        <span>{role.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {role.description || <span className="text-xs italic text-slate-400">Sin descripción</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(role)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar rol"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            disabled={isBasic}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBasic 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isBasic ? 'No se pueden borrar roles básicos' : 'Eliminar rol'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
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
                {editingRole ? 'Editar Rol' : 'Crear Rol'}
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
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  placeholder="Ej: coordinador, auxiliar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={editingRole !== null && ['admin', 'professor', 'student'].includes(editingRole.name)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Descripción
                </label>
                <textarea
                  placeholder="Describe brevemente la función de este rol..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-medium"
                />
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
                  {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;
