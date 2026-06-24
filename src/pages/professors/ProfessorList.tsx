import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';

interface Professor {
  id: string;
  name: string;
  email: string;
  specialty: string;
}

const ProfessorList: React.FC = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professors');
      setProfessors(response.data);
    } catch (err: any) {
      console.error('Error fetching professors:', err);
      setError('No se pudo cargar la lista de profesores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al profesor "${name}"? Esta acción borrará también su cuenta de usuario y los cursos que tenga asignados se quedarán sin profesor.`)) {
      return;
    }

    try {
      await api.delete(`/professors/${id}`);
      setProfessors(professors.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting professor:', err);
      alert('No se pudo eliminar al profesor.');
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
          <h2 className="text-xl font-bold text-slate-900">Gestión de Profesores</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra el cuerpo docente de la universidad y sus datos de especialidad.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/professors/new"
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Profesor</span>
          </Link>
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
        {professors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <GraduationCap size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No hay profesores registrados</p>
            {isAdmin && (
              <Link to="/professors/new" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                Comienza registrando tu primer profesor
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Especialidad</th>
                  <th className="px-6 py-4">Correo</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {professors.map((professor) => (
                  <tr key={professor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {professor.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg text-xs">
                        {professor.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {professor.email}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/professors/edit/${professor.id}`}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar profesor"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(professor.id, professor.name)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar profesor"
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

    </div>
  );
};

export default ProfessorList;
