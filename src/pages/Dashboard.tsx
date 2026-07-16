import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Clock,
  UserCheck,
  BookMarked,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface PeriodStatItem {
  period_name: string;
  enrollments_count: number;
}

interface DashboardStats {
  students_count: number;
  professors_count: number;
  courses_count: number;
  enrollments_count: number;
  recent_activity: ActivityItem[];
  enrollments_by_period: PeriodStatItem[];
}

interface StudentEnrollment {
  id: string;
  course_name: string;
  course_code: string;
  period: string;
  grade: number | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [studentPayments, setStudentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?.role === 'student') {
          // Si es estudiante, cargar sus matrículas reales para el dashboard
          const enrollmentsRes = await api.get('/enrollments');
          setStudentEnrollments(enrollmentsRes.data);

          // Cargar pagos del estudiante
          const paymentsRes = await api.get('/payments');
          setStudentPayments(paymentsRes.data);
        } else {
          // Si es admin/professor, cargar estadísticas de control
          const response = await api.get('/dashboard');
          setStats(response.data);
        }
      } catch (err: any) {
        console.error('Error al cargar datos del dashboard', err);
        setError('No se pudieron cargar los datos del panel.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  // ================= STUDENT VIEW =================
  if (user?.role === 'student') {
    // Calcular créditos reales matriculados (mock de créditos para cursos o podemos simular 4 por curso)
    const totalCredits = studentEnrollments.length * 4; 

    // Calificaciones reales o promedio real
    const gradedEnrollments = studentEnrollments.filter(e => e.grade !== null);
    const averageGrade = gradedEnrollments.length > 0
      ? Math.round(gradedEnrollments.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedEnrollments.length)
      : 'Sin notas';

    // Saldo pendiente real de pagos
    const pendingAmount = studentPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const recentPendingPayments = studentPayments.filter(p => p.status === 'pending').slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Fila de Tarjetas Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Promedio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promedio General</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{averageGrade}</h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
              <BookMarked size={24} />
            </div>
          </div>
          {/* Card Créditos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Créditos Matriculados</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalCredits}</h3>
            </div>
            <div className="bg-sky-50 text-sky-600 p-4 rounded-xl">
              <FileText size={24} />
            </div>
          </div>
          {/* Card Saldo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Pendiente</p>
              <h3 className={`text-3xl font-extrabold mt-2 ${pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₡{pendingAmount.toLocaleString()}
              </h3>
            </div>
            <div className={`p-4 rounded-xl ${pendingAmount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Listado Cursos Actuales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BookMarked className="text-blue-600" size={20} />
            <span>Cursos Actuales</span>
          </h2>
          {studentEnrollments.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No estás matriculado en ningún curso actualmente.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentEnrollments.map((enr) => (
                <div key={enr.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{enr.course_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{enr.course_code} | Período: {enr.period}</p>
                  </div>
                  <span className={`font-bold px-3 py-1.5 rounded-lg text-xs ${
                    enr.grade !== null 
                      ? enr.grade >= 70 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                      : 'bg-slate-50 text-slate-500'
                  }`}>
                    {enr.grade !== null ? enr.grade : 'Cursando'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos Pagos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <DollarSign className="text-blue-600" size={20} />
            <span>Próximos Pagos Pendientes</span>
          </h2>
          {recentPendingPayments.length === 0 ? (
            <p className="text-sm text-emerald-600 font-medium py-2 flex items-center space-x-1.5">
              <span>Al día. No registras cargos pendientes de pago.</span>
            </p>
          ) : (
            <div className="space-y-3">
              {recentPendingPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 text-amber-800 p-2 rounded-lg">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Pago de Matrícula Pendiente</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Fecha: {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-sm text-slate-800">₡{p.amount}</span>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-lg text-xs">
                      Pendiente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= ADMIN / PROFESSOR VIEW =================
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <UserCheck className="text-emerald-600" size={18} />;
      case 'student':
        return <Users className="text-blue-600" size={18} />;
      case 'professor':
        return <GraduationCap className="text-indigo-600" size={18} />;
      default:
        return <Clock className="text-slate-600" size={18} />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'bg-emerald-50';
      case 'student':
        return 'bg-blue-50';
      case 'professor':
        return 'bg-indigo-50';
      default:
        return 'bg-slate-100';
    }
  };

  const periodData = stats?.enrollments_by_period || [];
  const maxEnrollmentsCount = Math.max(...periodData.map(d => d.enrollments_count), 5);

  return (
    <div className="space-y-6">
      {/* Fila de Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card Estudiantes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiantes</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.students_count || 0}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
            <Users size={24} />
          </div>
        </div>

        {/* Card Profesores */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profesores</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.professors_count || 0}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Card Cursos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cursos</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.courses_count || 0}</h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Card Matrículas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matrículas</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.enrollments_count || 0}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
            <FileText size={24} />
          </div>
        </div>

      </div>

      {/* Gráfico de Matrículas por Período */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <FileText className="text-blue-600" size={20} />
          <span>Matrículas por Período Académico</span>
        </h2>
        {periodData.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No hay períodos académicos registrados.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] h-60 relative flex flex-col justify-end">
              <svg viewBox="0 0 600 240" className="w-full h-full">
                {/* Rotated Y-Axis Label */}
                <text
                  transform="translate(12, 100) rotate(-90)"
                  textAnchor="middle"
                  className="text-[9px] font-bold text-slate-400 uppercase tracking-wider"
                  fill="currentColor"
                >
                  Matrículas
                </text>

                {/* Y-Axis Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const yVal = 20 + ratio * 160;
                  const countLabel = Math.round(maxEnrollmentsCount * (1 - ratio));
                  return (
                    <g key={index}>
                      <line x1="60" y1={yVal} x2="570" y2={yVal} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <text x="35" y={yVal + 4} textAnchor="end" className="text-[10px] font-semibold text-slate-400" fill="currentColor">
                        {countLabel}
                      </text>
                    </g>
                  );
                })}
                
                {/* Columns */}
                {periodData.map((item, idx) => {
                  const xGap = 490 / periodData.length;
                  const xPos = 70 + idx * xGap;
                  const barWidth = Math.min(45, xGap - 20);
                  const barHeight = (item.enrollments_count / maxEnrollmentsCount) * 160;
                  const yPos = 180 - barHeight;

                  return (
                    <g key={item.period_name} className="group cursor-pointer">
                      {/* Column Rect */}
                      <rect
                        x={xPos}
                        y={yPos}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        className="fill-sky-400 group-hover:fill-navy-800 transition-colors duration-200"
                      />
                      {/* Tooltip value */}
                      <text
                        x={xPos + barWidth / 2}
                        y={yPos - 8}
                        textAnchor="middle"
                        className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        fill="currentColor"
                      >
                        {item.enrollments_count}
                      </text>
                      {/* Label X-axis */}
                      <text
                        x={xPos + barWidth / 2}
                        y="205"
                        textAnchor="middle"
                        className="text-[10px] font-semibold text-slate-500"
                        fill="currentColor"
                      >
                        {item.period_name}
                      </text>
                    </g>
                  );
                })}
                <line x1="60" y1="180" x2="570" y2="180" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Clock className="text-blue-600" size={20} />
          <span>Actividad Reciente</span>
        </h2>

        {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
          <p className="text-sm text-slate-500 py-6 text-center">No se ha registrado actividad reciente.</p>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
            {stats.recent_activity.map((item) => (
              <div key={item.id} className="relative">
                {/* Indicador circular de icono en la línea de tiempo */}
                <span className={`absolute -left-[43px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-slate-100 ${getActivityBg(item.type)}`}>
                  {getActivityIcon(item.type)}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{item.description}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{new Date(item.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
