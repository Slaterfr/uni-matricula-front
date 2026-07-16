import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, CreditCard, ShieldAlert, Award } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'matricula' | 'pagos' | 'calificaciones' | 'general';
  icon: React.ReactNode;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'matricula',
      icon: <BookOpen size={16} />,
      question: '¿Cuál es el límite máximo de créditos que puedo matricular por ciclo?',
      answer: 'Para garantizar un rendimiento académico óptimo y evitar sobrecarga de materias, el sistema impone un límite paramétrico estricto de hasta un máximo de 12 créditos inscritos en un mismo período académico activo. El formulario de matrícula impedirá agregar más asignaturas si superas esta cantidad.'
    },
    {
      category: 'matricula',
      icon: <BookOpen size={16} />,
      question: '¿Qué sucede si un curso que deseo matricular ya no tiene cupos disponibles?',
      answer: 'El sistema valida en tiempo real la disponibilidad física o digital del curso. Si un curso alcanza su capacidad máxima configurable, la matrícula para esa sección se bloqueará mostrando la etiqueta de "Cupo lleno". Deberás contactar a la administración o seleccionar otro horario.'
    },
    {
      category: 'pagos',
      icon: <CreditCard size={16} />,
      question: '¿Cómo se calculan y generan las cuotas de facturación de matrícula?',
      answer: 'Al confirmar la matrícula de tus cursos del período, la plataforma realiza un cálculo informativo del costo correspondiente y genera de inmediato un cargo en estado "Pendiente" bajo tu "Control de Facturación". Podrás consultarlo y visualizar tu saldo consolidado desde tu Dashboard o la sección de Pagos.'
    },
    {
      category: 'calificaciones',
      icon: <Award size={16} />,
      question: '¿Cómo y cuándo puedo ver mis calificaciones oficiales y promedio ponderado?',
      answer: 'Puedes ingresar a la sección de "Calificaciones" en el menú lateral. El sistema te mostrará una boleta detallada por período con las notas registradas por tus profesores y el cálculo automático de tu promedio ponderado. Si una materia aún no ha sido evaluada, aparecerá como "Cursando".'
    },
    {
      category: 'general',
      icon: <ShieldAlert size={16} />,
      question: '¿Cuál es mi contraseña inicial por defecto para ingresar al portal?',
      answer: 'Para los Estudiantes, la contraseña de seguridad inicial por defecto coincide exactamente con su número de carné único (ej: BD-101 o ANA-105). Para los Profesores, el sistema asigna la contraseña provisional "Temporal123!".'
    },
    {
      category: 'general',
      icon: <HelpCircle size={16} />,
      question: '¿Cómo funciona la asignación de profesores a los cursos?',
      answer: 'Los administradores del sistema vinculan oficialmente a un profesor a cargo de cada asignatura. Esto permite que el profesor pueda acceder a las actas de notas exclusivas de sus materias asignadas y visualizar el listado (roster) de estudiantes matriculados en tiempo real.'
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'matricula':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pagos':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'calificaciones':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="text-blue-600" size={24} />
          <span>Preguntas Frecuentes (FAQ)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Respuestas rápidas a las consultas y políticas administrativas más recurrentes de UniMatrícula.
        </p>
      </div>

      {/* Lista de acordeón */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Trigger */}
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-slate-50/50"
              >
                <div className="flex items-center space-x-4">
                  {/* Category Badge */}
                  <span className={`hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getCategoryBadge(faq.category)}`}>
                    {faq.icon}
                    <span className="ml-1">{faq.category}</span>
                  </span>
                  
                  <span className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                </div>
                
                <span className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>

              {/* Panel de respuesta */}
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[500px] border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="px-6 py-5 text-sm text-slate-600 leading-relaxed bg-slate-50/30">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
