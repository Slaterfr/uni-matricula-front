import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface Professor {
  id: string;
  name: string;
  specialty: string;
}

const CourseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [professorId, setProfessorId] = useState('');
  const [professors, setProfessors] = useState<Professor[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadProfessors = async () => {
      try {
        const response = await api.get('/professors');
        setProfessors(response.data);
      } catch (err) {
        console.error('Error fetching professors list:', err);
      }
    };
    loadProfessors();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/courses/${id}`);
          const { code, name, credits, professor_id } = response.data;
          setCode(code);
          setName(name);
          setCredits(credits);
          setProfessorId(professor_id || '');
        } catch (err: any) {
          console.error('Error fetching course details:', err);
          setError('No se pudieron cargar los datos del curso.');
        } finally {
          setFetching(false);
        }
      };
      fetchCourse();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      code,
      name,
      credits: Number(credits),
      professor_id: professorId === '' ? null : professorId,
    };

    try {
      if (isEditMode) {
        await api.put(`/courses/${id}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      navigate('/courses');
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(
        err.response?.data?.detail || 
        'Ocurrió un error al guardar la información del curso.'
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
          to="/courses"
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditMode ? 'Editar Curso' : 'Registrar Curso'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode 
              ? 'Modifica los datos y asignación del curso.' 
              : 'Agrega un nuevo curso a la oferta curricular.'}
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
          
          {/* Código del curso */}
          <div>
            <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Código del Curso
            </label>
            <input
              id="code"
              type="text"
              required
              placeholder="Ej: INF-103"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nombre del curso */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre de la Materia
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Ej: Estructuras de Datos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Créditos */}
          <div>
            <label htmlFor="credits" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Créditos
            </label>
            <input
              id="credits"
              type="number"
              required
              min={1}
              max={10}
              placeholder="Ej: 4"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selector de Profesor */}
          <div>
            <label htmlFor="professorId" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Profesor Encargado
            </label>
            <select
              id="professorId"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un profesor (opcional)</option>
              {professors.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} ({prof.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/courses"
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
              <span>{loading ? 'Guardando...' : 'Guardar Curso'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default CourseForm;
