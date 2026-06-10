/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, Language } from '../types';
import { TRANSLATIONS } from '../utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ScoreboardHeaderProps {
  gameState: GameState;
  language: Language;
}

export default function ScoreboardHeader({ gameState, language }: ScoreboardHeaderProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const {
    awayTeam,
    homeTeam,
    currentInning,
    isTopInning,
    awayRunsTotal,
    homeRunsTotal,
    awayHitsTotal,
    homeHitsTotal,
    awayErrorsTotal,
    homeErrorsTotal,
    inningScores,
  } = gameState;

  // Render innings numbers (at least 7, but expands if currentInning > 7)
  const totalInningsToShow = Math.max(7, currentInning);
  const inningsHeader: number[] = [];
  for (let i = 1; i <= totalInningsToShow; i++) {
    inningsHeader.push(i);
  }

  // Get score for specific inning and team
  const getInningScoreStr = (inningNum: number, team: 'away' | 'home') => {
    const inning = inningScores.find(s => s.inning === inningNum);
    if (!inning) return '-';
    
    const value = team === 'away' ? inning.awayRuns : inning.homeRuns;
    return value === null ? '-' : String(value);
  };

  // Format elapsed seconds to hh:mm:ss
  const formatTimer = (totalSeconds: number = 0) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const currentHalfInningLabel = () => {
    const suffix = (n: number) => {
      if (n === 1) return 'st';
      if (n === 2) return 'nd';
      if (n === 3) return 'rd';
      return 'th';
    };

    const labelEn = `${isTopInning ? 'Top' : 'Bottom'} of the ${currentInning}${suffix(currentInning)}`;
    const labelMs = `${isTopInning ? 'Atas' : 'Bawah'} Ining Ke-${currentInning}`;
    return isEn ? labelEn : labelMs;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      {/* Absolute background graphics */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main broadcast header score details */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* TEAM NAMES AND RUNS CARDS */}
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-start">
          
          {/* Away team block */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-850/50 p-3 rounded-2xl border border-slate-800/80 shadow-md">
            <div className="text-right">
              <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight">{awayTeam.name || 'Away Team'}</h2>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">{isEn ? 'Away' : 'Pelawat'}</p>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-1 text-3xl font-black text-emerald-400 ring-2 ring-emerald-500/20 min-w-[54px] text-center transition-all">
              {awayRunsTotal}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-black text-slate-500 tracking-widest">VS</span>
            {gameState.status === 'live' && (
              <div className="mt-1 flex items-center justify-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-[9px] text-slate-300 font-bold font-mono">
                {isTopInning ? <span className="text-amber-400">▲</span> : <span className="text-rose-400">▼</span>}
                {currentInning}
              </div>
            )}
          </div>

          {/* Home team block */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-850/50 p-3 rounded-2xl border border-slate-800/80 shadow-md">
            <div className="bg-slate-800 rounded-xl px-4 py-1 text-3xl font-black text-rose-500 ring-2 ring-rose-500/20 min-w-[54px] text-center transition-all">
              {homeRunsTotal}
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight">{homeTeam.name || 'Home Team'}</h2>
              <p className="text-[10px] text-rose-400 font-mono uppercase tracking-widest">{isEn ? 'Home' : 'Tuan Rumah'}</p>
            </div>
          </div>

        </div>

        {/* Dynamic status display */}
        <div className="text-center md:text-right bg-slate-950/45 px-5 py-2.5 rounded-2xl border border-slate-800/80 w-full md:w-auto flex flex-col gap-1 md:items-end">
          {gameState.status === 'live' ? (
            <>
              <div className="text-[9px] font-mono font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5 justify-center md:justify-end">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {isEn ? 'LIVE SCOREKEEPING' : 'SKOR LANGSUNG'}
              </div>
              <div className="text-xs font-bold text-slate-100 mt-1">
                {currentHalfInningLabel()}
              </div>
              <div className="mt-0.5">
                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase border ${
                  gameState.gameMode === 'fastpitch' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-indigo-505/10 text-indigo-400 border-indigo-505/20'
                }`}>
                  {gameState.gameMode === 'fastpitch' 
                    ? (isEn ? "⚡ Fastpitch (10 Batters / 9 Defense)" : "⚡ Fastpitch (10 Pemukul / 9 Pemadang)") 
                    : (isEn ? "🐢 Slowpitch (10 Batters / 10 Defense)" : "🐢 Slowpitch (10 Pemukul / 10 Pemadang)")}
                </span>
              </div>
              {/* TIMING ENGINE METRICS */}
              <div className="text-[10px] font-mono text-slate-400 border-t border-slate-850 pt-1 mt-1 flex gap-3 justify-center md:justify-end items-center">
                <span className="text-indigo-400 font-bold">⏱️ {formatTimer(gameState.elapsedSeconds)}</span>
                <span className="opacity-40">|</span>
                <span>🕒 {isEn ? 'Start' : 'Mula'}: {gameState.startTime || '---'}</span>
              </div>
            </>
          ) : gameState.status === 'finished' ? (
            <>
              <div className="text-[9px] font-mono font-black tracking-widest text-slate-400 uppercase">
                {isEn ? 'GAME ARCHIVE' : 'STATUS PERLAWANAN'}
              </div>
              <div className="text-sm font-black text-amber-400 mt-1 uppercase tracking-tight">
                🏆 {isEn ? 'FINISHED' : 'TAMAT'}
              </div>
              <div className="mt-0.5">
                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase border ${
                  gameState.gameMode === 'fastpitch' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-indigo-505/10 text-indigo-400 border-indigo-505/20'
                }`}>
                  {gameState.gameMode === 'fastpitch' 
                    ? (isEn ? "⚡ Fastpitch (10 Batters / 9 Defense)" : "⚡ Fastpitch (10 Pemukul / 9 Pemadang)") 
                    : (isEn ? "🐢 Slowpitch (10 Batters / 10 Defense)" : "🐢 Slowpitch (10 Pemukul / 10 Pemadang)")}
                </span>
              </div>
              {/* TIMING ENGINE METRICS */}
              <div className="text-[10px] font-mono text-slate-400 border-t border-slate-850 pt-1 mt-1 flex gap-3 justify-center md:justify-end items-center">
                <span className="text-emerald-400 font-bold">⏱️ {formatTimer(gameState.elapsedSeconds)}</span>
                <span className="opacity-40">|</span>
                <span>🕒 {isEn ? 'Start' : 'Mula'}: {gameState.startTime || '---'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[9px] font-mono font-black tracking-widest text-slate-400 uppercase">
                {isEn ? 'NOT STARTED' : 'BELUM BERMULA'}
              </div>
              <div className="text-sm font-black text-slate-300 mt-1 uppercase tracking-tight">
                ⚙️ {isEn ? 'TEAM SETUP' : 'PERSEDIAAN PASUKAN'}
              </div>
              <div className="mt-0.5">
                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase border ${
                  gameState.gameMode === 'fastpitch' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-indigo-505/10 text-indigo-400 border-indigo-505/20'
                }`}>
                  {gameState.gameMode === 'fastpitch' 
                    ? (isEn ? "⚡ Fastpitch (10 Batters / 9 Defense)" : "⚡ Fastpitch (10 Pemukul / 9 Pemadang)") 
                    : (isEn ? "🐢 Slowpitch (10 Batters / 10 Defense)" : "🐢 Slowpitch (10 Pemukul / 10 Pemadang)")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Broadcast Line Score table */}
      <div className="w-full overflow-x-auto select-none">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
              <th className="text-left py-2 font-display text-xs text-slate-400 font-bold min-w-[120px]">
                {isEn ? 'TEAM' : 'PASUKAN'}
              </th>
              {inningsHeader.map(num => (
                <th
                  key={num}
                  className={`px-3 py-2 ${
                    currentInning === num && gameState.status === 'live'
                      ? 'text-indigo-400 font-bold bg-indigo-500/5 rounded-t-lg'
                      : ''
                  }`}
                >
                  {num}
                </th>
              ))}
              <th className="px-4 py-2 text-slate-300 font-bold border-l border-slate-800">{t.runsShort}</th>
              <th className="px-3 py-2 text-slate-300 font-bold">{t.hitsShort}</th>
              <th className="px-3 py-2 text-slate-300 font-bold">{t.errorsShort}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {/* Away Row */}
            <tr className="hover:bg-slate-850/20 text-slate-300 font-mono text-sm">
              <td className="text-left font-sans font-bold text-slate-200 truncate py-3 pr-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="truncate max-w-[140px]">{awayTeam.name || 'Away'}</span>
              </td>
              {inningsHeader.map(num => (
                <td
                  key={num}
                  className={`px-3 py-3 font-semibold ${
                    currentInning === num && isTopInning && gameState.status === 'live'
                      ? 'bg-indigo-500/10 text-indigo-300 font-bold'
                      : ''
                  }`}
                >
                  {getInningScoreStr(num, 'away')}
                </td>
              ))}
              {/* Totals */}
              <td className="px-4 py-3 text-rose-400 font-sans font-extrabold text-base border-l border-slate-800">{awayRunsTotal}</td>
              <td className="px-3 py-3 text-slate-400 font-sans font-semibold text-sm">{awayHitsTotal}</td>
              <td className="px-3 py-3 text-slate-500 font-sans font-semibold text-sm">{awayErrorsTotal}</td>
            </tr>

            {/* Home Row */}
            <tr className="hover:bg-slate-850/20 text-slate-300 font-mono text-sm">
              <td className="text-left font-sans font-bold text-slate-200 truncate py-3 pr-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[140px]">{homeTeam.name || 'Home'}</span>
              </td>
              {inningsHeader.map(num => (
                <td
                  key={num}
                  className={`px-3 py-3 font-semibold ${
                    currentInning === num && !isTopInning && gameState.status === 'live'
                      ? 'bg-indigo-500/10 text-indigo-300 font-bold'
                      : ''
                  }`}
                >
                  {getInningScoreStr(num, 'home')}
                </td>
              ))}
              {/* Totals */}
              <td className="px-4 py-3 text-emerald-400 font-sans font-extrabold text-base border-l border-slate-800">{homeRunsTotal}</td>
              <td className="px-3 py-3 text-slate-400 font-sans font-semibold text-sm">{homeHitsTotal}</td>
              <td className="px-3 py-3 text-slate-500 font-sans font-semibold text-sm">{homeErrorsTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
