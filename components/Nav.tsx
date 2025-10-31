
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { AppContextType, View } from '../types';

const Nav: React.FC = () => {
    const { currentView, setView } = useContext(AppContext) as AppContextType;

    const navItems: { id: View; label: string }[] = [
        { id: 'betting', label: 'Carga de Apuestas' },
        { id: 'reports', label: 'Reportes y Caja' },
        { id: 'results', label: 'Resultados' },
    ];

    return (
        <nav className="bg-blue-800 text-white p-2 shadow-md no-print">
            <div className="container mx-auto flex justify-center items-center space-x-2 md:space-x-4">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-200 ${
                            currentView === item.id 
                            ? 'bg-blue-900 text-yellow-300 shadow-inner' 
                            : 'bg-blue-700 hover:bg-blue-600'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Nav;
