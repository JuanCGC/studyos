import { createContext, useContext } from 'react';
import { usePomodoro } from './usePomodoro';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const timer = usePomodoro();
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
