
export type View = 'betting' | 'reports' | 'results';

export type BetType = 'Quiniela' | 'Redoblona';

export interface Bet {
  type: BetType;
  number: string;
  position: string;
  amount: number;
}

export interface LotterySelection {
  drawTime: string;
  lottery: string;
}

export interface Ticket {
  id: string;
  timestamp: number;
  bets: Bet[];
  lotteries: LotterySelection[];
  total: number;
}

export interface WinningNumber {
  position: number;
  number: string;
}

export type DrawResult = Record<string, WinningNumber[]>;
export type DailyResults = Record<string, DrawResult>;

export interface AppContextType {
  currentView: View;
  setView: (view: View) => void;
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  deleteTicket: (ticketId: string) => void;
  dailyResults: DailyResults;
  nextDraw: { name: string; number: number } | null;
}

export interface Draw {
    name: string;
    time: string;
}
