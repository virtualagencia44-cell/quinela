
import React, { useState, useContext, useMemo, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { DRAW_SCHEDULE, LOTTERIES } from '../constants';
import type { Bet, Ticket, BetType, AppContextType, LotterySelection } from '../types';
import TicketModal from './TicketModal';

const BettingView: React.FC = () => {
  const { addTicket, tickets } = useContext(AppContext) as AppContextType;

  const [selectedLotteries, setSelectedLotteries] = useState<Record<string, boolean>>({});
  const [betType, setBetType] = useState<BetType>('Quiniela');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingBets, setPendingBets] = useState<Bet[]>([]);
  const [ticketToPrint, setTicketToPrint] = useState<Ticket | null>(null);

  const numberInputRef = useRef<HTMLInputElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const handleSelect = (type: 'row' | 'col' | 'cell', value: string) => {
    const newSelection = { ...selectedLotteries };
    if (type === 'row') {
      LOTTERIES.forEach(lottery => {
        const key = `${value}-${lottery}`;
        newSelection[key] = !Object.keys(newSelection).some(k => k.startsWith(value + '-') && newSelection[k]);
      });
    } else if (type === 'col') {
      DRAW_SCHEDULE.forEach(draw => {
        if (draw.time > currentTime) {
            const key = `${draw.name}-${value}`;
            newSelection[key] = !Object.keys(newSelection).some(k => k.endsWith('-' + value) && newSelection[k]);
        }
      });
    } else {
      newSelection[value] = !newSelection[value];
    }
    setSelectedLotteries(newSelection);
  };

  const addBet = () => {
    if (!number || !position || !amount || parseFloat(amount) <= 0) {
      alert('Por favor, complete todos los campos de la apuesta.');
      return;
    }
    const newBet: Bet = {
      type: betType,
      number,
      position,
      amount: parseFloat(amount),
    };
    setPendingBets([...pendingBets, newBet]);
    setNumber('');
    setPosition('');
    setAmount('');
    numberInputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'number' | 'position' | 'amount') => {
    if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (field === 'number') positionInputRef.current?.focus();
        else if (field === 'position') amountInputRef.current?.focus();
        else if (field === 'amount') addBet();
    }
  };

  const removeBet = (index: number) => {
    setPendingBets(pendingBets.filter((_, i) => i !== index));
  };
  
  const selectedLotteriesCount = useMemo(() => Object.values(selectedLotteries).filter(Boolean).length, [selectedLotteries]);
  const subtotal = useMemo(() => pendingBets.reduce((sum, bet) => sum + bet.amount, 0), [pendingBets]);
  const total = useMemo(() => subtotal * selectedLotteriesCount, [subtotal, selectedLotteriesCount]);

  const finalizeTicket = () => {
    if (pendingBets.length === 0) {
      alert('Debe agregar al menos una apuesta.');
      return;
    }
    if (selectedLotteriesCount === 0) {
      alert('Debe seleccionar al menos una lotería.');
      return;
    }

    const finalLotteries: LotterySelection[] = Object.keys(selectedLotteries)
        .filter(key => selectedLotteries[key])
        .map(key => {
            const [drawTime, lottery] = key.split('-');
            return { drawTime, lottery };
        });

    const newTicket: Ticket = {
      id: `T-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      bets: pendingBets,
      lotteries: finalLotteries,
      total,
    };

    addTicket(newTicket);
    setTicketToPrint(newTicket);

    // Reset form
    setPendingBets([]);
    setSelectedLotteries({});
    setNumber('');
    setPosition('');
    setAmount('');
  };

  const repeatLastTicket = () => {
    if (tickets.length > 0) {
      const lastTicket = tickets[tickets.length - 1];
      setPendingBets(lastTicket.bets);
    } else {
      alert('No hay tickets anteriores para repetir.');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {ticketToPrint && <TicketModal ticket={ticketToPrint} onClose={() => setTicketToPrint(null)} />}
      {/* Left Column */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Selección de Sorteo/Loterías</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Sorteo</th>
              {LOTTERIES.map(lottery => (
                <th key={lottery} className="p-2 border">
                  <button onClick={() => handleSelect('col', lottery)} className="font-bold hover:text-blue-600">{lottery}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DRAW_SCHEDULE.map(draw => {
              const isPast = draw.time <= currentTime;
              return (
                <tr key={draw.name} className={`${isPast ? 'bg-gray-100 text-gray-400' : ''}`}>
                  <td className="p-2 border font-semibold">
                    <button onClick={() => !isPast && handleSelect('row', draw.name)} disabled={isPast} className={`${isPast ? 'line-through cursor-not-allowed' : 'hover:text-blue-600'}`}>
                      {draw.name} ({draw.time})
                    </button>
                  </td>
                  {LOTTERIES.map(lottery => {
                    const key = `${draw.name}-${lottery}`;
                    return (
                      <td key={key} className="p-2 border text-center">
                        <div className="relative flex justify-center items-center">
                          <input
                            type="checkbox"
                            checked={!!selectedLotteries[key]}
                            onChange={() => handleSelect('cell', key)}
                            disabled={isPast}
                            className="h-5 w-5 disabled:opacity-50"
                          />
                          {isPast && <span className="absolute text-red-500 font-bold text-xl pointer-events-none">X</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Right Column */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Jugadas</h2>
        
        <div className="flex border-b mb-4">
            <button className={`py-2 px-4 ${betType === 'Quiniela' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`} onClick={() => setBetType('Quiniela')}>Quiniela</button>
            <button className={`py-2 px-4 ${betType === 'Redoblona' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`} onClick={() => setBetType('Redoblona')}>Redoblona</button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <input ref={numberInputRef} onKeyDown={e => handleKeyDown(e, 'number')} value={number} onChange={e => setNumber(e.target.value)} type="text" placeholder="Número" className="p-2 border rounded" maxLength={4} />
          <input ref={positionInputRef} onKeyDown={e => handleKeyDown(e, 'position')} value={position} onChange={e => setPosition(e.target.value)} type="text" placeholder="Posición" className="p-2 border rounded" />
          <input ref={amountInputRef} onKeyDown={e => handleKeyDown(e, 'amount')} value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Importe" className="p-2 border rounded" />
        </div>
        <button onClick={addBet} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4">Agregar Apuesta</button>

        <div className="flex-grow border rounded p-2 mb-4 overflow-y-auto min-h-[150px]">
          {pendingBets.length === 0 ? (
            <p className="text-gray-500 text-center">No hay apuestas cargadas</p>
          ) : (
            <ul>
              {pendingBets.map((bet, index) => (
                <li key={index} className="flex justify-between items-center p-1 border-b">
                  <span>{bet.number} @ {bet.position} - ${bet.amount.toFixed(2)}</span>
                  <button onClick={() => removeBet(index)} className="text-red-500 hover:text-red-700 font-bold">x</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2 text-lg font-semibold">
          <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Loterías:</span><span>x {selectedLotteriesCount}</span></div>
          <div className="flex justify-between text-2xl font-bold text-blue-800 border-t pt-2"><span>TOTAL:</span><span>${total.toFixed(2)}</span></div>
        </div>

        <div className="mt-auto pt-4 flex gap-4">
          <button onClick={repeatLastTicket} className="w-full bg-gray-500 text-white p-3 rounded hover:bg-gray-600 font-bold">Repetir</button>
          <button onClick={finalizeTicket} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 font-bold text-xl">Finalizar</button>
        </div>
      </div>
    </div>
  );
};

export default BettingView;
