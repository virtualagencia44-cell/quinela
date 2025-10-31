
import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { AppContextType, Ticket } from '../types';
import TicketModal from './TicketModal';
import { PrinterIcon, TrashIcon } from './icons';

const getTodayDateStringInput = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Simplified prize calculation for simulation
const calculateWinnings = (ticket: Ticket, dailyResults: AppContextType['dailyResults']): { totalPrize: number, winningBets: any[] } => {
    let totalPrize = 0;
    const winningBets: any[] = [];

    ticket.lotteries.forEach(selection => {
        const drawResult = dailyResults[selection.drawTime];
        if (drawResult) {
            const lotteryResult = drawResult[selection.lottery];
            if (lotteryResult) {
                ticket.bets.forEach(bet => {
                    if (bet.type === 'Quiniela') {
                        const pos = parseInt(bet.position, 10);
                        if (pos >= 1 && pos <= 20) {
                            const winningNumber = lotteryResult.find(wn => wn.position === pos);
                            if (winningNumber && winningNumber.number.endsWith(bet.number)) {
                                const prize = bet.amount * 7; // Simplified multiplier
                                totalPrize += prize;
                                winningBets.push({
                                    ticketId: ticket.id,
                                    bet,
                                    prize,
                                    detail: `${selection.drawTime} (${selection.lottery})`
                                });
                            }
                        }
                    }
                });
            }
        }
    });

    return { totalPrize, winningBets };
};


const ReportsView: React.FC = () => {
    const { tickets, deleteTicket, dailyResults } = useContext(AppContext) as AppContextType;
    const [activeTab, setActiveTab] = useState<'sales' | 'winnings'>('sales');
    const [selectedDate, setSelectedDate] = useState(getTodayDateStringInput());
    const [ticketToPrint, setTicketToPrint] = useState<Ticket | null>(null);

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const ticketDate = new Date(ticket.timestamp).toISOString().split('T')[0];
            return ticketDate === selectedDate;
        });
    }, [tickets, selectedDate]);

    const totalRecaudado = useMemo(() => {
        return filteredTickets.reduce((sum, ticket) => sum + ticket.total, 0);
    }, [filteredTickets]);

    const winningData = useMemo(() => {
        let totalPrizes = 0;
        const winningTickets: { ticket: Ticket; prize: number }[] = [];
        
        filteredTickets.forEach(ticket => {
            const { totalPrize } = calculateWinnings(ticket, dailyResults);
            if (totalPrize > 0) {
                totalPrizes += totalPrize;
                winningTickets.push({ ticket, prize: totalPrize });
            }
        });
        
        return { totalPrizes, winningTickets };
    }, [filteredTickets, dailyResults]);

    const handleDelete = (ticketId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este ticket permanentemente?')) {
            deleteTicket(ticketId);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col">
            {ticketToPrint && <TicketModal ticket={ticketToPrint} onClose={() => setTicketToPrint(null)} />}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-800 mb-2 sm:mb-0">Reportes y Caja</h2>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded"
                />
            </div>

            <div className="flex border-b mb-4">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`py-2 px-4 ${activeTab === 'sales' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
                >
                    Movimientos/Ventas
                </button>
                <button
                    onClick={() => setActiveTab('winnings')}
                    className={`py-2 px-4 ${activeTab === 'winnings' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
                >
                    Aciertos y Pagos
                </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                {activeTab === 'sales' && (
                    <div>
                        <div className="bg-blue-100 p-4 rounded-lg mb-4">
                            <h3 className="text-lg font-bold text-blue-900">Total Recaudado: ${totalRecaudado.toFixed(2)}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2">Hora</th>
                                        <th className="p-2">Ticket N°</th>
                                        <th className="p-2 text-center">Apuestas</th>
                                        <th className="p-2 text-center">Loterías</th>
                                        <th className="p-2 text-right">Importe</th>
                                        <th className="p-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.map(ticket => (
                                        <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{new Date(ticket.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-2 text-xs font-mono">{ticket.id}</td>
                                            <td className="p-2 text-center">{ticket.bets.length}</td>
                                            <td className="p-2 text-center">{ticket.lotteries.length}</td>
                                            <td className="p-2 text-right font-semibold">${ticket.total.toFixed(2)}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center items-center space-x-3">
                                                    <button onClick={() => setTicketToPrint(ticket)} className="text-blue-500 hover:text-blue-700"><PrinterIcon /></button>
                                                    <button onClick={() => handleDelete(ticket.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {filteredTickets.length === 0 && <p className="text-center text-gray-500 mt-4">No hay tickets para la fecha seleccionada.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'winnings' && (
                     <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-blue-900">Total Recaudado: ${totalRecaudado.toFixed(2)}</h3>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-green-900">Total Premios: ${winningData.totalPrizes.toFixed(2)}</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2">Ticket N°</th>
                                        <th className="p-2">Hora</th>
                                        <th className="p-2 text-right">Importe Ticket</th>
                                        <th className="p-2 text-right">Premio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winningData.winningTickets.map(({ ticket, prize }) => (
                                        <tr key={ticket.id} className="border-b hover:bg-green-50">
                                            <td className="p-2 text-xs font-mono">{ticket.id}</td>
                                            <td className="p-2">{new Date(ticket.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-2 text-right">${ticket.total.toFixed(2)}</td>
                                            <td className="p-2 text-right font-bold text-green-700">${prize.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {winningData.winningTickets.length === 0 && <p className="text-center text-gray-500 mt-4">No hay tickets ganadores para la fecha seleccionada.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsView;
