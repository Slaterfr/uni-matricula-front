import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, CreditCard, CheckCircle, AlertCircle, Clock, Trash2, X, Search, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  student_carnet: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
}

interface StudentOption {
  id: string;
  name: string;
  carnet: string;
}

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Form fields
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [statusVal, setStatusVal] = useState<'pending' | 'paid' | 'cancelled'>('pending');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, studentsRes] = await Promise.all([
        api.get('/payments'),
        isAdmin ? api.get('/students') : Promise.resolve({ data: [] })
      ]);
      setPayments(paymentsRes.data);
      setStudents(studentsRes.data);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError('No se pudo cargar la información de pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPayment(null);
    setStudentId(students[0]?.id || '');
    setAmount('');
    setStatusVal('pending');
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setStudentId(payment.student_id);
    setAmount(payment.amount.toString());
    setStatusVal(payment.status);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount) {
      setSubmitError('El estudiante y el monto son campos obligatorios.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSubmitError('El monto debe ser un número positivo.');
      return;
    }

    try {
      if (editingPayment) {
        // Actualizar
        const response = await api.put(`/payments/${editingPayment.id}`, {
          student_id: studentId,
          amount: numericAmount,
          status: statusVal
        });
        setPayments(payments.map(p => p.id === editingPayment.id ? response.data : p));
      } else {
        // Registrar
        const response = await api.post('/payments', {
          student_id: studentId,
          amount: numericAmount,
          status: statusVal
        });
        setPayments([response.data, ...payments]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving payment:', err);
      const msg = err.response?.data?.detail || 'No se pudo registrar el pago.';
      setSubmitError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      return;
    }

    try {
      await api.delete(`/payments/${id}`);
      setPayments(payments.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      alert(err.response?.data?.detail || 'No se pudo eliminar el registro de pago.');
    }
  };

  // Metrics calculation
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filter list
  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.student_name?.toLowerCase().includes(term) ||
      p.student_carnet?.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: 'pending' | 'paid' | 'cancelled') => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle size={12} />
            <span>Pagado</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <Clock size={12} />
            <span>Pendiente</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
            <X size={12} />
            <span>Cancelado</span>
          </span>
        );
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
          <h2 className="text-xl font-bold text-slate-900">Estado de Pagos</h2>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent 
              ? 'Revisa tus cuotas académicas pendientes e historial de pagos completados.'
              : 'Administra y registra los montos por concepto de matrícula de la población estudiantil.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Registrar Pago</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recaudado / Pagado</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendiente de Cobro</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">${totalPending.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filtro de Búsqueda para administradores */}
      {!isStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Buscar Pago Estudiante
          </label>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Nombre, Carnet o Estado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {(isStudent ? payments : filteredPayments).length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No se encontraron registros de cobros ni pagos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                  {!isStudent && <th className="px-6 py-4">Estudiante</th>}
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Fecha de Registro</th>
                  <th className="px-6 py-4">Estado</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {(isStudent ? payments : filteredPayments).map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    {!isStudent && (
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{payment.student_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{payment.student_carnet}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(payment)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar pago"
                          >
                            <Plus size={16} className="rotate-45" />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar pago"
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

      {/* Modal de Registro / Edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPayment ? 'Actualizar Estado del Pago' : 'Registrar Nuevo Pago'}
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
                  Estudiante
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={editingPayment !== null}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold disabled:bg-slate-50 disabled:text-slate-450"
                >
                  <option value="">Selecciona un estudiante</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.carnet}] {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Monto ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Estado de Pago
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold"
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
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
                  {editingPayment ? 'Guardar Cambios' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
