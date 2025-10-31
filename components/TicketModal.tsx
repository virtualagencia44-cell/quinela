
import React from 'react';
import type { Ticket } from '../types';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 no-print">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <div className="print-area overflow-y-auto p-2" id="ticket-to-print">
            <div className="text-center font-mono text-sm text-black">
              <h2 className="text-lg font-bold">AGENCIA DE QUINIELA</h2>
              <p>--------------------------------</p>
              <p>TICKET: {ticket.id}</p>
              <p>FECHA: {new Date(ticket.timestamp).toLocaleString('es-AR')}</p>
              <p>--------------------------------</p>
              
              <div className="text-left my-2">
                <p className="font-bold">SORTEOS Y LOTERIAS:</p>
                <div className="grid grid-cols-3 gap-x-2 text-xs">
                    {ticket.lotteries.map((l, i) => (
                        <span key={i}>{l.lottery}-{l.drawTime.substring(0,3)}</span>
                    ))}
                </div>
              </div>
              
              <p>--------------------------------</p>
              <table className="w-full my-2">
                <thead>
                  <tr>
                    <th className="text-left">NUM</th>
                    <th className="text-left">POS</th>
                    <th className="text-right">IMP</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.bets.map((bet, index) => (
                    <tr key={index}>
                      <td className="text-left">{bet.number}</td>
                      <td className="text-left">{bet.position}</td>
                      <td className="text-right">${bet.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>--------------------------------</p>
              <div className="text-right font-bold text-lg">
                <p>TOTAL: ${ticket.total.toFixed(2)}</p>
              </div>
              <p className="mt-4">*** NO VALIDO COMO TICKET ***</p>
            </div>
        </div>
        <div className="mt-auto pt-4 flex justify-between gap-4">
          <button onClick={onClose} className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
            Cerrar
          </button>
          <button onClick={handlePrint} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
