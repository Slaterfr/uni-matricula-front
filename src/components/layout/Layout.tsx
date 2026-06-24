import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Barra de menú lateral */}
      <Sidebar />
      
      {/* Contenido principal del dashboard */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior con datos de usuario */}
        <Header />
        
        {/* Cuerpo de página con scroll independiente */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
