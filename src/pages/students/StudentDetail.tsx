import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, CreditCard, Award, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  carnet: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface Enrollment {
  id: string;
  course_code: string;
  course_name: string;
  period: string;
  grade: number | null;
}

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
}

const StudentDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grades' | 'payments'>('grades');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // 1. Cargar estudiante
        const studentRes = await api.get(`/students/${id}`);
        setStudent(studentRes.data);

        // 2. Cargar matrículas y filtrar por estudiante
        const enrollmentsRes = await api.get('/enrollments');
        const studentEnrollments = enrollmentsRes.data.filter((e: any) => e.student_id === id);
        setEnrollments(studentEnrollments);

        // 3. Cargar pagos y filtrar por estudiante si no es profesor
        if (user?.role === 'admin' || user?.role === 'student') {
          const paymentsRes = await api.get('/payments');
          const studentPayments = paymentsRes.data.filter((p: any) => p.student_id === id);
          setPayments(studentPayments);
        }
      } catch (err: any) {
        console.error('Error fetching student detail data:', err);
        setError('No se pudo cargar la información del estudiante.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudentData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Link to="/students" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 space-x-1">
          <ArrowLeft size={14} />
          <span>Volver a la lista</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error || 'Estudiante no encontrado.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de Regresar */}
      <Link
        to="/students"
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 space-x-1 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Volver a Estudiantes</span>
      </Link>

      {/* Tarjeta de Expediente de Estudiante */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
          <User size={36} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-950">{student.name}</h2>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                student.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {student.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-400">Carnet: {student.carnet}</div>
          
          <div className="flex flex-wrap gap-y-2 gap-x-6 pt-2 text-xs font-medium text-slate-500">
            <span className="flex items-center space-x-1.5">
              <Mail size={14} className="text-slate-400" />
              <span>{student.email}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Phone size={14} className="text-slate-400" />
              <span>{student.phone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('grades')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'grades' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Award size={16} />
            <span>Historial Académico</span>
          </span>
          {activeTab === 'grades' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
          )}
        </button>
        {(user?.role === 'admin' || user?.role === 'student') && (
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'payments' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <CreditCard size={16} />
              <span>Historial de Pagos</span>
            </span>
            {activeTab === 'payments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        )}
      </div>

      {/* Contenido de Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'grades' && (
          <div>
            {enrollments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">El estudiante no cuenta con cursos matriculados.</p>
              </div>
            ) : (
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
                  {enrollments.map((enr) => {
                    const isApproved = enr.grade !== null && enr.grade >= 70;
                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{enr.course_code}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{enr.course_name}</td>
                        <td className="px-6 py-4 text-slate-500">{enr.period}</td>
                        <td className="px-6 py-4 text-center font-extrabold text-slate-900">
                          {enr.grade !== null ? enr.grade.toFixed(2) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {enr.grade === null ? (
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
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">El estudiante no cuenta con historial de pagos.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Fecha de Pago</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        ₡{pay.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(pay.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            pay.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : pay.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {pay.status === 'paid' ? 'Pagado' : pay.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
