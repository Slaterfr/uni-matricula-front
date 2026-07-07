import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';

interface Period {
  id: string;
  name: string;
  is_active: boolean;
}

const PeriodList: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/periods');
      setPeriods(response.data);
    } catch (err: any) {
      console.error('Error fetching periods:', err);
      setError('No se pudo cargar la lista de períodos académicos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleOpenCreate = () => {
    setEditingPeriod(null);
    setName('');
    setIsActive(true);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (period: Period) => {
    setEditingPeriod(period);
    setName(period.name);
    setIsActive(period.is_active);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('El nombre del período es requerido.');
      return;
    }

    try {
      if (editingPeriod) {
        // Actualizar
        const response = await api.put(`/periods/${editingPeriod.id}`, {
          name: name.trim(),
          is_active: isActive,
        });
        
        // Si activamos el período, desactivamos todos los demás localmente
        if (isActive) {
          setPeriods(periods.map(p => p.id === editingPeriod.id 
            ? response.data 
            : { ...p, is_active: false }
          ));
        } else {
          setPeriods(periods.map(p => p.id === editingPeriod.id ? response.data : p));
        }
      } else {
        // Crear nuevo
        const response = await api.post('/periods', {
          name: name.trim(),
          is_active: isActive,
        });

        if (isActive) {
          setPeriods([response.data, ...periods.map(p => ({ ...p, is_active: false }))]);
        } else {
          setPeriods([response.data, ...periods]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving period:', err);
      const msg = err.response?.data?.detail || 'No se pudo guardar el período académico.';
      setSubmitError(msg);
    }
  };

  const handleDelete = async (id: string, periodName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el período "${periodName}"?`)) {
      return;
    }

    try {
      await api.delete(`/periods/${id}`);
      setPeriods(periods.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting period:', err);
      const msg = err.response?.data?.detail || 'No se pudo eliminar el período académico.';
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
          <h2 className="text-xl font-bold text-slate-900">Períodos Académicos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra los ciclos de matrícula (ej. I 2026, II 2026). Solo un período puede estar activo a la vez.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Período</span>
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
        {periods.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No hay períodos académicos registrados</p>
            {isAdmin && (
              <button onClick={handleOpenCreate} className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                Registra tu primer período académico
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  <th className="px-6 py-4">Nombre del Período</th>
                  <th className="px-6 py-4">Estado</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {periods.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {period.name}
                    </td>
                    <td className="px-6 py-4">
                      {period.is_active ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle size={12} />
                          <span>Activo (Matrícula Abierta)</span>
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          Inactivo
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(period)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar período"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(period.id, period.name)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar período"
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
        )}
      </div>

      {/* Modal de Creación / Edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPeriod ? 'Editar Período Académico' : 'Crear Período Académico'}
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
                  Nombre del Período
                </label>
                <input
                  type="text"
                  placeholder="Ej: I 2026, II 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold"
                />
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
                  Marcar como activo
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
                  {editingPeriod ? 'Guardar Cambios' : 'Crear Período'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodList;
