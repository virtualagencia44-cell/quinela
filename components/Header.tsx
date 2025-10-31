
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { AppContextType } from '../types';

const Header: React.FC = () => {
    const { nextDraw } = useContext(AppContext) as AppContextType;
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const formattedTime = currentTime.toLocaleTimeString('es-AR');

    return (
        <header className="bg-blue-900 text-white p-3 shadow-md no-print">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold">Agencia de Quiniela</h1>
                <div className="text-center">
                    {nextDraw && (
                        <>
                            <p className="text-sm font-semibold text-yellow-300">PRÓXIMO SORTEO</p>
                            <p className="text-lg font-bold">{nextDraw.name.toUpperCase()} N° {nextDraw.number}</p>
                        </>
                    )}
                </div>
                <div className="text-right text-sm md:text-base">
                    <p className="font-bold">{formattedTime}</p>
                    <p>{formattedDate}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
