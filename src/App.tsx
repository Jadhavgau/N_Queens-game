/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCcw, 
  Lightbulb, 
  Trophy, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Crown,
  AlertCircle
} from "lucide-react";

// --- Types ---

interface Position {
  row: number;
  col: number;
}

// --- Utils & Logic ---

/**
 * Checks if two queens attack each other.
 */
const isAttacking = (q1: Position, q2: Position) => {
  return (
    q1.row === q2.row ||
    q1.col === q2.col ||
    Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)
  );
};

/**
 * Backtracking algorithm to find a solution.
 */
const solveNQueens = (n: number): Position[] | null => {
  const result: Position[] = [];
  
  const isSafe = (row: number, col: number, queens: Position[]) => {
    for (const q of queens) {
      if (q.col === col || Math.abs(q.row - row) === Math.abs(q.col - col)) {
        return false;
      }
    }
    return true;
  };

  const solve = (row: number): boolean => {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col, result)) {
        result.push({ row, col });
        if (solve(row + 1)) return true;
        result.pop();
      }
    }
    return false;
  };

  return solve(0) ? result : null;
};

// --- Components ---

export default function App() {
  const [n, setN] = useState(8);
  const [queens, setQueens] = useState<Position[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showAutoSolveMsg, setShowAutoSolveMsg] = useState(false);
  const [logs, setLogs] = useState<{ id: number; text: string; type: 'info' | 'user' | 'warn' | 'success' }[]>([
    { id: Date.now(), text: `Board initialized size ${n}`, type: 'info' }
  ]);

  const addLog = useCallback((text: string, type: 'info' | 'user' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [...prev.slice(-15), { id: Date.now(), text, type }]);
  }, []);

  // Reset or initialize
  const resetGame = useCallback(() => {
    setQueens([]);
    setIsWon(false);
    setShowAutoSolveMsg(false);
    addLog('Grid reset to idle state', 'info');
  }, [addLog]);

  // Handle board size change
  const handleNChange = (newN: number) => {
    setN(newN);
    setQueens([]);
    setIsWon(false);
    addLog(`Board size changed to ${newN}x${newN}`, 'info');
  };

  // Find all conflicting queens
  const conflicts = useMemo(() => {
    const indices = new Set<number>();
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        if (isAttacking(queens[i], queens[j])) {
          indices.add(i);
          indices.add(j);
        }
      }
    }
    return indices;
  }, [queens]);

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (isWon) return;

    const existingIndex = queens.findIndex(q => q.row === row && q.col === col);
    const coords = `${String.fromCharCode(65 + col)}${n - row}`;

    if (existingIndex !== -1) {
      // Remove queen
      setQueens(queens.filter((_, i) => i !== existingIndex));
      addLog(`Queen removed from ${coords}`, 'user');
    } else {
      // Place queen
      if (queens.length < n) {
        setQueens([...queens, { row, col }]);
        addLog(`Queen placed at ${coords}`, 'user');
      } else {
        addLog(`Maximum capacity reached for N=${n}`, 'warn');
      }
    }
  };

  // Auto-solve
  const handleSolve = () => {
    addLog(`Initiating backtracking engine for N=${n}...`, 'info');
    const solution = solveNQueens(n);
    if (solution) {
      setQueens(solution);
      setShowAutoSolveMsg(true);
      addLog('Optimal solution found and applied', 'success');
    } else {
      addLog('No solution exists for current configuration', 'warn');
    }
  };

  // Check win condition
  useEffect(() => {
    if (queens.length === n && conflicts.size === 0) {
      setIsWon(true);
      addLog('Objective achieved: All queens safely placed', 'success');
    } else if (conflicts.size > 0 && queens.length === n) {
      // Logic for show warning only when full and conflict
      // or we can handle warning whenever conflict changes
    }
  }, [queens.length, n, conflicts.size, addLog]);

  useEffect(() => {
    if (conflicts.size > 0) {
      addLog(`Conflict detected: ${conflicts.size} units compromised`, 'warn');
    }
  }, [conflicts.size, addLog]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white uppercase flex items-center gap-2">
            N-Queens <span className="text-slate-500 font-normal tracking-widest hidden sm:inline text-sm">Strategy Engine</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Engine Active
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-bold transition-all border border-slate-700 text-slate-300 uppercase tracking-widest active:scale-95 shadow-lg shadow-black/20">
            System Docs
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto custom-scrollbar">
          
          {/* Configuration Section */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Configuration</h2>
            <div className="space-y-4 bg-slate-800/20 p-4 rounded-xl border border-slate-800/50">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-300 font-medium">Board Size (N)</label>
                <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{n} x {n}</span>
              </div>
              <input 
                type="range" 
                min="4" 
                max="12" 
                value={n} 
                onChange={(e) => handleNChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold uppercase tracking-tighter">
                <span>Min: 4</span>
                <span>Max: 12</span>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Performance</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Placed</p>
                <p className="text-2xl font-display font-bold text-white leading-none">
                  {queens.length} <span className="text-slate-500 text-sm font-normal">/ {n}</span>
                </p>
              </div>
              <div className={`p-4 rounded-xl border transition-colors ${conflicts.size > 0 ? 'bg-red-950/20 border-red-500/30' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${conflicts.size > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Conflicts</p>
                <p className={`text-2xl font-display font-bold leading-none ${conflicts.size > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{conflicts.size}</p>
              </div>
            </div>
          </section>

          {/* Backtracking Visualizer Feed */}
          <section className="flex-1 flex flex-col gap-4 min-h-0">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Algorithm Feed</h2>
            <div className="flex-1 bg-black/40 rounded-xl border border-slate-800 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-inner">
              {logs.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className={`shrink-0 font-bold uppercase ${
                    log.type === 'info' ? 'text-indigo-400' : 
                    log.type === 'user' ? 'text-slate-500' : 
                    log.type === 'warn' ? 'text-amber-500' : 
                    'text-emerald-500'
                  }`}>
                    [{log.type}]
                  </span>
                  <span className={log.type === 'user' ? 'text-slate-300' : 'text-slate-400'}>{log.text}</span>
                </div>
              ))}
              <div className="text-slate-600 mt-2 animate-pulse">_ Accessing next node...</div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-800">
            <button 
              onClick={handleSolve}
              className="group flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/10 transition-all active:scale-95 border border-indigo-400/20"
            >
              <Lightbulb size={18} className="group-hover:rotate-12 transition-transform" />
              SOLVE ENGINE
            </button>
            <button 
              onClick={resetGame}
              className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all border border-slate-700 active:scale-95"
            >
              <RotateCcw size={16} />
              RESET GRID
            </button>
          </div>
        </aside>

        {/* Game Board Section */}
        <section className="flex-1 bg-slate-950 relative flex items-center justify-center p-8 lg:p-12">
          
          <div className="relative">
            {/* The Chessboard Grid */}
            <div 
              className="grid gap-0 border-[6px] border-slate-800 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] relative group/board"
              style={{ 
                gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                width: 'min(80vw, 80vh, 580px)',
                aspectRatio: '1/1'
              }}
            >
              {Array.from({ length: n * n }).map((_, idx) => {
                const row = Math.floor(idx / n);
                const col = idx % n;
                const isDark = (row + col) % 2 === 1;
                const queenIndex = queens.findIndex(q => q.row === row && q.col === col);
                const hasConflict = queenIndex !== -1 && conflicts.has(queenIndex);

                return (
                  <button
                    key={idx}
                    onClick={() => handleSquareClick(row, col)}
                    className={`
                      relative group transition-all duration-200
                      ${isDark ? 'bg-slate-700' : 'bg-slate-300'}
                      hover:brightness-110 active:brightness-90
                    `}
                  >
                    {/* Hover indicator */}
                    {queenIndex === -1 && !isWon && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 text-slate-900 pointer-events-none transition-opacity">
                        <Crown className="w-3/5 h-3/5" />
                      </div>
                    )}

                    {/* The Queen */}
                    <AnimatePresence>
                      {queenIndex !== -1 && (
                        <motion.div
                          initial={{ scale: 0.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={`
                            absolute inset-0 flex items-center justify-center p-[15%] pointer-events-none z-10
                            ${hasConflict ? 'filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]' : 'filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]'}
                          `}
                        >
                          <Crown className={`w-full h-full ${hasConflict ? 'text-red-500' : 'text-slate-900'}`} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Conflict Zone */}
                    {hasConflict && (
                      <div className="absolute inset-0 bg-red-500/40 border-2 border-red-500 animate-pulse pointer-events-none" />
                    )}
                  </button>
                );
              })}

              {/* Coordinates: Y-axis (8-1) */}
              <div className="absolute -left-10 top-0 h-full flex flex-col justify-around text-[10px] font-mono font-black text-slate-600 select-none">
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i} className="flex items-center justify-center h-full">{n - i}</span>
                ))}
              </div>

              {/* Coordinates: X-axis (A-H) */}
              <div className="absolute -bottom-8 left-0 w-full flex justify-around text-[10px] font-mono font-black text-slate-600 select-none">
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i} className="flex items-center justify-center w-full">{String.fromCharCode(65 + i)}</span>
                ))}
              </div>
            </div>

            {/* Win Modal Overlay */}
            <AnimatePresence>
              {isWon && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center p-4 rounded-xl"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-700 p-10 rounded-2xl shadow-[0_0_100px_-20px_rgba(79,70,229,0.4)] text-center relative max-w-sm"
                  >
                    <div className="mb-6 relative">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <Trophy className="text-slate-950 w-8 h-8" />
                      </div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    </div>
                    
                    <h2 className="text-2xl font-display font-bold text-white mb-2 leading-tight">OBJECTIVE COMPLETE</h2>
                    <p className="text-slate-400 text-sm mb-8">
                      {showAutoSolveMsg 
                        ? "Engine successfully resolved the N-Queens constraint challenge."
                        : "Strategic placement validated. All security constraints are satisfied."
                      }
                    </p>
                    <button
                      onClick={resetGame}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                      INITIALIZE NEW SESSION
                    </button>
                    
                    {/* Progress Dots */}
                    <div className="mt-8 flex justify-center gap-1.5 opacity-30">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-8 right-8 bg-slate-900/60 backdrop-blur-xl px-5 py-3 rounded-xl border border-slate-800 shadow-2xl flex gap-6 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-slate-300 rounded shadow-sm"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Valid Unit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-red-500 animate-pulse rounded shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Threat Zone</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0 select-none">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SYSTEM: READY</span>
          <span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${isWon ? 'bg-indigo-500' : 'bg-slate-700 animate-pulse'}`}></span> PROCESS: {isWon ? 'SUCCESS' : 'ACTIVE'}</span>
          <span className="flex items-center gap-2 hidden sm:flex"><span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span> BUFFER: 12.4MB</span>
        </div>
        <div className="flex gap-6">
          <span className="text-indigo-400 font-black">ST-LOGIC V2.4</span>
          <span className="hidden md:inline">© 2026 STRATAGEM LABS</span>
        </div>
      </footer>
    </div>
  );
}

