import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const StudentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [carnet, setCarnet] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchStudent = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/students/${id}`);
          const { carnet, name, email, phone, status } = response.data;
          setCarnet(carnet);
          setName(name);
          setEmail(email);
          setPhone(phone);
          setStatus(status);
        } catch (err: any) {
          console.error('Error fetching student details:', err);
          setError('No se pudieron cargar los datos del estudiante.');
        } finally {
          setFetching(false);
        }
      };
      fetchStudent();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validar nombre
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
    if (!nameRegex.test(name.trim())) {
      setError('El nombre completo solo puede contener letras, tildes y espacios.');
      setLoading(false);
      return;
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      setError('Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).');
      setLoading(false);
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    const payload = {
      carnet: carnet.trim(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      ...(isEditMode && { status }),
    };

    try {
      if (isEditMode) {
        await api.put(`/students/${id}`, {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          status,
        });
      } else {
        await api.post('/students', payload);
      }
      navigate('/students');
    } catch (err: any) {
      console.error('Error saving student:', err);
      setError(
        err.response?.data?.detail || 
        'Ocurrió un error al guardar la información del estudiante.'
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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Botón de retroceso y Título */}
      <div className="flex items-center space-x-4">
        <Link
          to="/students"
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditMode ? 'Editar Estudiante' : 'Crear Estudiante'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode 
              ? 'Modifica los datos del expediente estudiantil.' 
              : 'Registra un nuevo expediente académico.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjeta del formulario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Carnet */}
          <div>
            <label htmlFor="carnet" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Carnet del Estudiante
            </label>
            <input
              id="carnet"
              type="text"
              required
              placeholder="Ej: 20260001"
              disabled={isEditMode}
              value={carnet}
              onChange={(e) => setCarnet(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Nombre completo */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre Completo
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Ej: Juan Pérez Gómez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Ej: juan.perez@universidad.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Teléfono de Contacto
            </label>
            <input
              id="phone"
              type="text"
              required
              placeholder="Ej: 8888-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado (Solo en modo edición) */}
          {isEditMode && (
            <div>
              <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Estado de Matrícula
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/students"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Guardando...' : 'Guardar Estudiante'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default StudentForm;
