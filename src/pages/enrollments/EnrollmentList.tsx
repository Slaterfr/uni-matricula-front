import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  student_carnet: string;
  course_id: string;
  course_name: string;
  course_code: string;
  period: string;
}

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isProfessor = user?.role === 'professor';

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enrollments');
      setEnrollments(response.data);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setError('No se pudo cargar la lista de matrículas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleDelete = async (id: string, studentName: string, courseName: string) => {
    const confirmMessage = isStudent
      ? `¿Estás seguro de que deseas desmatricularte del curso "${courseName}"?`
      : `¿Estás seguro de que deseas eliminar la matrícula del estudiante "${studentName}" en el curso "${courseName}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await api.delete(`/enrollments/${id}`);
      setEnrollments(enrollments.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      alert('No se pudo retirar la matrícula.');
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
          <h2 className="text-xl font-bold text-slate-900">Control de Matrículas</h2>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent
              ? 'Listado de asignaturas en las que estás registrado oficialmente.'
              : 'Control y registro de inscripciones estudiantiles.'}
          </p>
        </div>
        {!isProfessor && (
          <Link
            to="/enrollments/new"
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>{isStudent ? 'Matricular Cursos' : 'Nueva Matrícula'}</span>
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
        {enrollments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No se registran matrículas activas</p>
            {!isProfessor && (
              <Link to="/enrollments/new" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                {isStudent ? 'Registra tus cursos para este período' : 'Comienza registrando tu primera matrícula'}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  {!isStudent && <th className="px-6 py-4">Estudiante</th>}
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Período</th>
                  {!isProfessor && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                    {!isStudent && (
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{enrollment.student_name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{enrollment.student_carnet}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {enrollment.course_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {enrollment.course_code}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg text-xs">
                        {enrollment.period}
                      </span>
                    </td>
                    {!isProfessor && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(enrollment.id, enrollment.student_name, enrollment.course_name)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={isStudent ? "Retirar materia" : "Eliminar matrícula"}
                        >
                          <Trash2 size={16} />
                        </button>
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

export default EnrollmentList;
