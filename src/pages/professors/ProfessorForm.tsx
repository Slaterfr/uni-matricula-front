import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const ProfessorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchProfessor = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/professors/${id}`);
          const { name, email, specialty } = response.data;
          setName(name);
          setEmail(email);
          setSpecialty(specialty);
        } catch (err: any) {
          console.error('Error fetching professor details:', err);
          setError('No se pudieron cargar los datos del profesor.');
        } finally {
          setFetching(false);
        }
      };
      fetchProfessor();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      email,
      specialty,
    };

    try {
      if (isEditMode) {
        await api.put(`/professors/${id}`, {
          name,
          email,
          specialty,
        });
      } else {
        await api.post('/professors', payload);
      }
      navigate('/professors');
    } catch (err: any) {
      console.error('Error saving professor:', err);
      setError(
        err.response?.data?.detail || 
        'Ocurrió un error al guardar la información del profesor.'
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
          to="/professors"
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditMode ? 'Editar Profesor' : 'Registrar Profesor'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode 
              ? 'Modifica los datos del expediente del docente.' 
              : 'Registra un nuevo profesor en el cuerpo docente.'}
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
          
          {/* Nombre completo */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre Completo
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Ej: Dr. Manuel Salas Solís"
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
              placeholder="Ej: manuel.salas@universidad.com"
              disabled={isEditMode}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Especialidad */}
          <div>
            <label htmlFor="specialty" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Especialidad Académica
            </label>
            <input
              id="specialty"
              type="text"
              required
              placeholder="Ej: Bases de Datos, Redes de Computadoras"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/professors"
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
              <span>{loading ? 'Guardando...' : 'Guardar Profesor'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default ProfessorForm;
