import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import ProfessorList from './pages/professors/ProfessorList';
import ProfessorForm from './pages/professors/ProfessorForm';
import CourseList from './pages/courses/CourseList';
import CourseForm from './pages/courses/CourseForm';
import EnrollmentList from './pages/enrollments/EnrollmentList';
import EnrollmentForm from './pages/enrollments/EnrollmentForm';

// Componente para proteger rutas privadas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas privadas envueltas en el Layout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/students/new" element={<StudentForm />} />
                    <Route path="/students/edit/:id" element={<StudentForm />} />
                    <Route path="/professors" element={<ProfessorList />} />
                    <Route path="/professors/new" element={<ProfessorForm />} />
                    <Route path="/professors/edit/:id" element={<ProfessorForm />} />
                    <Route path="/courses" element={<CourseList />} />
                    <Route path="/courses/new" element={<CourseForm />} />
                    <Route path="/courses/edit/:id" element={<CourseForm />} />
                    <Route path="/enrollments" element={<EnrollmentList />} />
                    <Route path="/enrollments/new" element={<EnrollmentForm />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
