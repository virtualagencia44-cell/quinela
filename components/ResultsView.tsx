
import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DRAW_SCHEDULE, LOTTERIES } from '../constants';
import type { AppContextType, Ticket } from '../types';

const getTodayDateStringInput = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const calculateAllWinnings = (tickets: Ticket[], dailyResults: AppContextType['dailyResults']): any[] => {
    const allWinningBets: any[] = [];
    tickets.forEach(ticket => {
        ticket.lotteries.forEach(selection => {
            const drawResult = dailyResults[selection.drawTime];
            if (drawResult) {
                const lotteryResult = drawResult[selection.lottery];
                if (lotteryResult) {
                    ticket.bets.forEach(bet => {
                        const posRange = bet.position.split('-').map(p => parseInt(p, 10));
                        const fromPos = posRange[0];
                        const toPos = posRange.length > 1 ? posRange[1] : fromPos;

                        for (let i = fromPos; i <= toPos; i++) {
                             if (i >= 1 && i <= 20) {
                                const winningNumber = lotteryResult.find(wn => wn.position === i);
                                if (winningNumber && winningNumber.number.endsWith(bet.number)) {
                                    const prize = bet.amount * 7; // Simplified multiplier
                                    allWinningBets.push({
                                        ticketId: ticket.id,
                                        winningBet: `${bet.number} @ ${bet.position}`,
                                        prize,
                                        detail: `${selection.drawTime} (${selection.lottery}) - Pos ${i}`
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    });
    return allWinningBets;
};

const ResultsView: React.FC = () => {
    const { dailyResults, tickets } = useContext(AppContext) as AppContextType;
    const [selectedDate, setSelectedDate] = useState(getTodayDateStringInput());

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const ticketDate = new Date(ticket.timestamp).toISOString().split('T')[0];
            return ticketDate === selectedDate;
        });
    }, [tickets, selectedDate]);
    
    const allWinnings = useMemo(() => calculateAllWinnings(filteredTickets, dailyResults), [filteredTickets, dailyResults]);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                 <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded shadow-sm"
                />
            </div>

            {/* Resultados Oficiales */}
            <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Resultados Oficiales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {DRAW_SCHEDULE.map(draw => (
                        dailyResults[draw.name] ? (
                            <div key={draw.name} className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-center mb-2">{draw.name}</h3>
                                {LOTTERIES.map(lottery => (
                                    <details key={lottery} className="mb-2">
                                        <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded">{lottery}</summary>
                                        <table className="w-full text-sm mt-2">
                                            <tbody>
                                                {dailyResults[draw.name][lottery]?.map(wn => (
                                                    <tr key={wn.position} className={`${wn.position === 1 ? 'bg-yellow-200 font-bold' : ''}`}>
                                                        <td className="p-1 border text-center w-1/4">{wn.position}°</td>
                                                        <td className="p-1 border text-center">{wn.number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </details>
                                ))}
                            </div>
                        ) : null
                    ))}
                </div>
            </div>

            {/* Aciertos de Jugadas */}
            <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">Aciertos de Jugadas</h2>
                <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Ticket N°</th>
                                <th className="p-2">Jugada Ganadora</th>
                                <th className="p-2">Detalle Acierto</th>
                                <th className="p-2 text-right">Premio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allWinnings.map((win, index) => (
                                <tr key={index} className="border-b hover:bg-green-50">
                                    <td className="p-2 font-mono text-xs">{win.ticketId}</td>
                                    <td className="p-2 font-semibold">{win.winningBet}</td>
                                    <td className="p-2">{win.detail}</td>
                                    <td className="p-2 text-right font-bold text-green-700">${win.prize.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {allWinnings.length === 0 && <p className="text-center text-gray-500 mt-4">No hay aciertos para la fecha seleccionada.</p>}
                </div>
            </div>
        </div>
    );
};

export default ResultsView;
