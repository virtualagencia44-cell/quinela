
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Ticket, DailyResults, View, AppContextType, Draw } from '../types';
import { DRAW_SCHEDULE } from '../constants';

export const AppContext = createContext<AppContextType | null>(null);

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setView] = useState<View>('betting');
    const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', []);
    const [dailyResults, setDailyResults] = useLocalStorage<DailyResults>('results-' + getTodayDateString(), {});
    const [nextDraw, setNextDraw] = useState<{ name: string; number: number } | null>(null);

    const addTicket = (ticket: Ticket) => {
        setTickets(prev => [...prev, ticket]);
    };

    const deleteTicket = (ticketId: string) => {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
    };

    const generateResultsForDraw = useCallback((draw: Draw) => {
        const newResults = { ...dailyResults };
        if (!newResults[draw.name]) {
            newResults[draw.name] = {};
            const lotteries = ['NAC', 'PRO', 'SFE', 'CBA', 'STG', 'MZA'];
            lotteries.forEach(lottery => {
                const winningNumbers = [];
                for (let i = 1; i <= 20; i++) {
                    winningNumbers.push({
                        position: i,
                        number: String(Math.floor(Math.random() * 10000)).padStart(4, '0')
                    });
                }
                newResults[draw.name][lottery] = winningNumbers;
            });
            setDailyResults(newResults);
        }
    }, [dailyResults, setDailyResults]);

    const updateSchedule = useCallback(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        let upcomingDraw: Draw | null = null;
        for (const draw of DRAW_SCHEDULE) {
            if (draw.time > currentTime) {
                upcomingDraw = draw;
                break;
            } else {
                generateResultsForDraw(draw);
            }
        }
        
        if (!upcomingDraw) {
             upcomingDraw = DRAW_SCHEDULE[0]; // Next day's first draw
        }

        if (upcomingDraw) {
            const drawIndex = DRAW_SCHEDULE.findIndex(d => d.name === upcomingDraw!.name);
            const baseNumber = 51596 + Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) * 5;
            const drawNumber = baseNumber + drawIndex;
            
            const newNextDraw = { name: upcomingDraw.name, number: drawNumber };
            if (JSON.stringify(newNextDraw) !== JSON.stringify(nextDraw)) {
              setNextDraw(newNextDraw);
              document.title = `Quiniela - ${newNextDraw.name} N° ${newNextDraw.number}`;
            }
        }

    }, [generateResultsForDraw, nextDraw]);

    useEffect(() => {
        updateSchedule();
        const interval = setInterval(updateSchedule, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue: AppContextType = {
        currentView,
        setView,
        tickets,
        addTicket,
        deleteTicket,
        dailyResults,
        nextDraw
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
