import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Check, Edit3, Award, Search, AlertCircle, FileText, X } from 'lucide-react';

interface GradeItem {
  id: string;
  student_id: string;
  student_name: string;
  student_carnet: string;
  course_id: string;
  course_name: string;
  course_code: string;
  period_id: string;
  period: string;
  grade: number | null;
}

interface CourseOption {
  id: string;
  name: string;
  code: string;
  professor_id: string | null;
}

interface PeriodOption {
  id: string;
  name: string;
}

const GradeList: React.FC = () => {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);

  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'admin' || user?.role === 'professor';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, coursesRes, periodsRes] = await Promise.all([
        api.get('/grades'),
        isStaff ? api.get('/courses') : Promise.resolve({ data: [] }),
        isStaff ? api.get('/periods') : Promise.resolve({ data: [] })
      ]);
      setGrades(gradesRes.data);
      setCourses(coursesRes.data);
      setPeriods(periodsRes.data);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      setError('No se pudo cargar el listado de calificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartEdit = (item: GradeItem) => {
    setEditingId(item.id);
    setTempGrade(item.grade !== null ? item.grade.toString() : '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveGrade = async (id: string) => {
    const numericGrade = parseFloat(tempGrade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      alert('Por favor introduce una nota válida entre 0.00 y 100.00.');
      return;
    }

    try {
      setSaveLoading(true);
      const response = await api.put(`/grades/${id}`, {
        grade: numericGrade
      });
      setGrades(grades.map(g => g.id === id ? response.data : g));
      setEditingId(null);
    } catch (err: any) {
      console.error('Error saving grade:', err);
      alert(err.response?.data?.detail || 'No se pudo guardar la calificación.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Filter logic
  const filteredGrades = grades.filter((item) => {
    const matchesCourse = selectedCourse ? item.course_id === selectedCourse : true;
    const matchesPeriod = selectedPeriod ? item.period_id === selectedPeriod : true;
    const matchesSearch = studentSearch
      ? item.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        item.student_carnet.toLowerCase().includes(studentSearch.toLowerCase())
      : true;
    return matchesCourse && matchesPeriod && matchesSearch;
  });

  // Calculating Average for student report card
  const gradedCourses = grades.filter(g => g.grade !== null);
  const averageGrade = gradedCourses.length > 0
    ? (gradedCourses.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedCourses.length).toFixed(2)
    : '0.00';

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
      <div>
        <h2 className="text-xl font-bold text-slate-900">Control de Calificaciones</h2>
        <p className="text-xs text-slate-500 mt-1">
          {isStudent
            ? 'Visualiza tu expediente académico de calificaciones y promedios por período.'
            : 'Registra y edita las calificaciones definitivas correspondientes a las matrículas activas.'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* RENDER ESTUDIANTE (Boleta de Notas) */}
      {isStudent && (
        <div className="space-y-6">
          {/* Promedio General */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-10">
                <Award size={160} />
              </div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Promedio Ponderado</p>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold">{averageGrade}</span>
                <span className="text-sm font-semibold text-blue-200">/ 100</span>
              </div>
              <p className="text-xs text-blue-200 mt-4">Calculado sobre {gradedCourses.length} materias finalizadas.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cursos Registrados</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{grades.length}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Tabla de notas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {grades.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Award size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">No registras matrículas ni historial de notas todavía.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                      <th className="px-6 py-4">Código</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Período</th>
                      <th className="px-6 py-4 text-center">Nota Final</th>
                      <th className="px-6 py-4 text-center">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {grades.map((item) => {
                      const isApproved = item.grade !== null && item.grade >= 70;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-slate-500">{item.course_code}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{item.course_name}</td>
                          <td className="px-6 py-4 text-slate-500">{item.period}</td>
                          <td className="px-6 py-4 text-center font-extrabold text-slate-900">
                            {item.grade !== null ? item.grade.toFixed(2) : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.grade === null ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                Cursando
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                Aprobado
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
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
        </div>
      )}

      {/* RENDER PERSONAL (Administradores/Profesores) */}
      {isStaff && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Curso */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Filtrar por Curso
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
              >
                <option value="">Todos los cursos</option>
                {(user?.role === 'professor'
                  ? courses.filter(c => c.professor_id === user.profileId)
                  : courses
                ).map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Filtrar por Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
              >
                <option value="">Todos los períodos</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda de Estudiante */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Buscar Estudiante
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre o Carnet..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Tabla de registros */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredGrades.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Search size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">No se encontraron matrículas con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Período</th>
                      <th className="px-6 py-4 text-center">Nota Final</th>
                      <th className="px-6 py-4 text-center">Resultado</th>
                      <th className="px-6 py-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredGrades.map((item) => {
                      const isApproved = item.grade !== null && item.grade >= 70;
                      const isEditing = editingId === item.id;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.student_name}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.student_carnet}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.course_name}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.course_code}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{item.period}</td>
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={tempGrade}
                                onChange={(e) => setTempGrade(e.target.value)}
                                className="w-20 px-2 py-1 text-center font-bold border border-sky-500 focus:outline-none rounded-lg text-sm bg-sky-50/50"
                              />
                            ) : (
                              <span className="font-extrabold text-slate-900">
                                {item.grade !== null ? item.grade.toFixed(2) : '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.grade === null ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                Sin nota
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                Aprobado
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                                Reprobado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => handleSaveGrade(item.id)}
                                  disabled={saveLoading}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors shadow-sm"
                                  title="Guardar"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-colors"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              >
                                <Edit3 size={12} />
                                <span>Calificar</span>
                              </button>
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
        </div>
      )}
    </div>
  );
};

export default GradeList;
