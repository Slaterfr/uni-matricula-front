import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, UserPlus, AlertCircle, Search, Eye } from 'lucide-react';

interface Student {
  id: string;
  carnet: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await api.get('/students', { params });
      setStudents(response.data);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError('No se pudo cargar la lista de estudiantes.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    fetchStudents();
  }, [search, status]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al estudiante "${name}"? Esta acción borrará también su cuenta de usuario.`)) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('No se pudo eliminar al estudiante.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestión de Estudiantes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra los registros y cuentas de acceso de la población estudiantil.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/students/new"
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Estudiante</span>
          </Link>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o carnet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
          />
          <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
        </div>

        {/* Estado */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2">Buscando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <UserPlus size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No se encontraron estudiantes registrados</p>
            {isAdmin && (
              <Link to="/students/new" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                Comienza registrando tu primer estudiante
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  <th className="px-6 py-4">Carnet</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">
                      {student.carnet}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          student.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/students/detail/${student.id}`}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Ver Expediente"
                        >
                          <Eye size={16} />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to={`/students/edit/${student.id}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar estudiante"
                            >
                              <Edit2 size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(student.id, student.name)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar estudiante"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

export default StudentList;
