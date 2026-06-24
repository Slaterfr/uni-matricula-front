import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, AlertCircle, CheckSquare, Square } from 'lucide-react';

interface Student {
  id: string;
  carnet: string;
  name: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  professor_name: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  period: string;
}

const EnrollmentForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [studentId, setStudentId] = useState('');
  const [period, setPeriod] = useState('II Cuatrimestre 2026');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setFetching(true);
        
        // 1. Cargar cursos
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);

        // 2. Cargar matrículas generales para calcular cupos
        const enrollmentsRes = await api.get('/enrollments');
        setEnrollments(enrollmentsRes.data);

        if (isStudent) {
          // Si es estudiante, el ID es su propio profileId
          if (user?.profileId) {
            setStudentId(user.profileId);
            
            // Cargar su info particular de estudiante para mostrar en el select
            try {
              const studentRes = await api.get(`/students/${user.profileId}`);
              setStudents([studentRes.data]);
            } catch (err) {
              console.error('Error al cargar perfil del estudiante:', err);
            }
          }
        } else {
          // Si es admin, cargar la lista de todos los estudiantes
          const studentsRes = await api.get('/students');
          setStudents(studentsRes.data);
          if (studentsRes.data.length > 0) {
            setStudentId(studentsRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos iniciales de matrícula:', err);
        setError('Ocurrió un error al cargar la información.');
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      loadInitialData();
    }
  }, [user, isStudent]);

  // Contar cuántos estudiantes están matriculados en cada curso en el periodo actual
  const getEnrollmentCount = (courseId: string) => {
    return enrollments.filter(
      (e) => e.course_id === courseId && e.period === period
    ).length;
  };

  // Asignar cupo máximo estático y horario para replicar la captura
  const getCourseSpecs = (_code: string, idx: number) => {
    const capacities = [25, 30, 30, 20, 25];
    const schedules = [
      'Lun-Mié 8:00am',
      'Mar-Jue 10:00am',
      'Vie 7:00am',
      'Lun-Mié 2:00pm',
      'Sáb 9:00am'
    ];
    
    return {
      max: capacities[idx % capacities.length],
      schedule: schedules[idx % schedules.length]
    };
  };

  const handleToggleCourse = (courseId: string, isFull: boolean) => {
    if (isFull) return; // Evitar seleccionar si está lleno
    
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  // Calcular total de créditos seleccionados
  const totalCredits = courses
    .filter((c) => selectedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Por favor, selecciona un estudiante.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      setError('Por favor, selecciona al menos un curso para matricular.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Enviar matrículas concurrentemente para cada curso seleccionado
      await Promise.all(
        selectedCourseIds.map((courseId) =>
          api.post('/enrollments', {
            student_id: studentId,
            course_id: courseId,
            period: period,
          })
        )
      );
      navigate('/enrollments');
    } catch (err: any) {
      console.error('Error al guardar matrículas:', err);
      setError(
        err.response?.data?.detail || 
        'Ocurrió un error al procesar la matrícula. Verifica que no existan materias previamente inscritas en este período.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      
      {/* Retroceso y título */}
      <div className="flex items-center space-x-4">
        <Link
          to="/enrollments"
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Nueva Matrícula</h2>
          <p className="text-xs text-slate-500 mt-1">
            Inscribe materias para el cuatrimestre activo.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario de Matrícula (Copia idéntica a tu captura de pantalla) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Encabezado azul de la tarjeta */}
        <div className="bg-navy-800 text-white px-6 py-4 border-b border-navy-900">
          <h3 className="font-bold text-base">Nueva matrícula</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Campo Estudiante */}
          <div>
            <label htmlFor="student" className="block text-sm text-slate-600 font-medium mb-1.5">
              Estudiante
            </label>
            <select
              id="student"
              required
              disabled={isStudent}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="block w-full px-4 py-3 bg-brand-darkInput text-white border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-90"
            >
              {isStudent && students.length === 0 && (
                <option value={user?.profileId}>Cargando expediente...</option>
              )}
              {students.map((stud) => (
                <option key={stud.id} value={stud.id}>
                  {stud.name} — Carné {stud.carnet}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Periodo */}
          <div>
            <label htmlFor="period" className="block text-sm text-slate-600 font-medium mb-1.5">
              Período académico
            </label>
            <select
              id="period"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="block w-full px-4 py-3 bg-brand-darkInput text-white border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="II Cuatrimestre 2026">II Cuatrimestre 2026</option>
              <option value="III Cuatrimestre 2026">III Cuatrimestre 2026</option>
              <option value="I Cuatrimestre 2027">I Cuatrimestre 2027</option>
            </select>
          </div>

          {/* Cursos Disponibles */}
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-3">
              Cursos disponibles
            </label>

            {courses.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No hay cursos registrados para ofertar.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course, idx) => {
                  const specs = getCourseSpecs(course.code, idx);
                  const enrolledCount = getEnrollmentCount(course.id);
                  const isFull = enrolledCount >= specs.max;
                  const isChecked = selectedCourseIds.includes(course.id);

                  // Estilos del Badge de cupos
                  let badgeClass = 'bg-emerald-50 text-emerald-700';
                  let badgeText = `${enrolledCount}/${specs.max} cupos`;

                  if (isFull) {
                    badgeClass = 'bg-rose-50 text-rose-700';
                    badgeText = 'Cupo lleno';
                  } else if (specs.max - enrolledCount <= 2) {
                    badgeClass = 'bg-amber-50 text-amber-700';
                  }

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleToggleCourse(course.id, isFull)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/20'
                          : isFull
                          ? 'border-slate-100 bg-slate-50/30 opacity-70 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox e información del curso */}
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {isChecked ? (
                            <CheckSquare className="text-blue-600" size={18} />
                          ) : (
                            <Square className="text-slate-400" size={18} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{course.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Prof. {course.professor_name || 'Sin asignar'} · {specs.schedule}
                          </p>
                        </div>
                      </div>

                      {/* Badge de Cupo */}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total de Créditos y Botón Matricular */}
          <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Total créditos</span>
              <span className="text-lg font-extrabold text-slate-800">{totalCredits}</span>
            </div>

            <button
              type="submit"
              disabled={loading || selectedCourseIds.length === 0}
              className="w-full py-3 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-lg text-sm shadow-md shadow-navy-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Matriculando...</span>
              ) : (
                <span>Matricular</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default EnrollmentForm;
