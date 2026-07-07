import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, Eye, X, Users } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  professor_id: string | null;
  professor_name: string | null;
  max_capacity: number;
}

interface EnrolledStudent {
  id: string;
  student_name: string;
  student_carnet: string;
  grade: number | null;
  period: string;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Roster modal states
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [roster, setRoster] = useState<EnrolledStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isProfessor = user?.role === 'professor';
  const hasActions = isAdmin || isProfessor;

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('No se pudo cargar la lista de cursos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el curso "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('No se pudo eliminar el curso.');
    }
  };

  const handleOpenRoster = async (course: Course) => {
    setSelectedCourse(course);
    setRosterModalOpen(true);
    setRosterLoading(true);
    try {
      const response = await api.get('/enrollments');
      const filtered = response.data.filter((e: any) => e.course_id === course.id);
      setRoster(filtered);
    } catch (err) {
      console.error('Error loading roster:', err);
      alert('No se pudo cargar la lista de alumnos inscritos.');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleCloseRoster = () => {
    setRosterModalOpen(false);
    setSelectedCourse(null);
    setRoster([]);
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
          <h2 className="text-xl font-bold text-slate-900">Listado de Cursos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Oferta académica de la institución, número de créditos y profesorado a cargo.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/courses/new"
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nuevo Curso</span>
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
        {courses.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No hay cursos registrados</p>
            {isAdmin && (
              <Link to="/courses/new" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                Comienza registrando tu primer curso
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Créditos</th>
                  <th className="px-6 py-4">Profesor</th>
                  {hasActions && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {courses.map((course) => {
                  const isAssignedToMe = isProfessor && course.professor_id === user?.profileId;
                  return (
                    <tr 
                      key={course.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isAssignedToMe ? 'bg-sky-50/20 font-medium' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-slate-600">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{course.name}</span>
                          {isAssignedToMe && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-850 uppercase tracking-wider">
                              Tu Curso
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg text-xs">
                          {course.credits} cr
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {course.professor_name ? (
                          <span className="font-medium text-slate-700">{course.professor_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">No asignado</span>
                        )}
                      </td>
                      {hasActions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {(isAdmin || isAssignedToMe) && (
                              <button
                                onClick={() => handleOpenRoster(course)}
                                className="p-1.5 text-slate-650 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Ver Alumnos Inscritos"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <Link
                                  to={`/courses/edit/${course.id}`}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar curso"
                                >
                                  <Edit2 size={16} />
                                </Link>
                                <button
                                  onClick={() => handleDelete(course.id, course.name)}
                                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Eliminar curso"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Roster Modal */}
      {rosterModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-950">
                  Rúbrica de Estudiantes Inscritos
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  [{selectedCourse.code}] {selectedCourse.name}
                </p>
              </div>
              <button onClick={handleCloseRoster} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {rosterLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="text-xs text-slate-500 mt-2">Cargando lista de estudiantes...</p>
                </div>
              ) : roster.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold">No hay estudiantes matriculados en este curso.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-150 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
                        <th className="px-4 py-3">Carnet</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Ciclo</th>
                        <th className="px-4 py-3 text-center">Calificación</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {roster.map((student) => {
                        const isApproved = student.grade !== null && student.grade >= 70;
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-slate-500">
                              {student.student_carnet}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {student.student_name}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {student.period}
                            </td>
                            <td className="px-4 py-3 text-center font-extrabold text-slate-950">
                              {student.grade !== null ? student.grade.toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {student.grade === null ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                  Cursando
                                </span>
                              ) : isApproved ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                  Aprobado
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                                  Reprobado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCloseRoster}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cerrar Rúbrica
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseList;
