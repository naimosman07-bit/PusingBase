/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { GameState } from '../types';

interface BaseMapProps {
  runners: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  onToggleBase: (base: 'first' | 'second' | 'third') => void;
  language: 'en' | 'ms';
  gameState: GameState;
}

export default function BaseMap({ runners, onToggleBase, language, gameState }: BaseMapProps) {
  const isEn = language === 'en';

  // Determine the active fielding (defensive) team
  // When it is Top inning (Away team is batting), the Home team is fielding.
  // When it is Bottom inning (Home team is batting), the Away team is fielding.
  const defendingTeam = gameState.isTopInning ? gameState.homeTeam : gameState.awayTeam;

  // Helper to render a player absolute dot
  const renderFielder = (posCode: string, absoluteClasses: string) => {
    const player = defendingTeam.roster.find(p => p.position === posCode);
    
    return (
      <div className={`absolute ${absoluteClasses} z-10 flex flex-col items-center group pointer-events-none`}>
        {player ? (
          <>
            {/* Jersey circle */}
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-400 text-[10px] font-black text-amber-400 flex items-center justify-center shadow-lg shadow-black/80 ring-2 ring-emerald-500/20 group-hover:scale-110 transition-transform">
              {player.number || '-'}
            </div>
            {/* Position and Name tags */}
            <div className="mt-0.5 px-1 py-0.5 bg-slate-950/90 border border-slate-800 rounded flex flex-col items-center shadow-md select-none max-w-[55px]">
              <span className="text-[7px] font-black text-indigo-400 font-mono tracking-tighter uppercase leading-none">
                {posCode}
              </span>
              <span className="text-[8px] font-bold text-slate-200 truncate w-12 text-center mt-px leading-none">
                {player.name ? player.name.split(' ')[0] : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Vacant circle */}
            <div className="w-5 h-5 rounded-full bg-slate-950/60 border border-dashed border-slate-700 text-[8px] font-semibold text-slate-500 flex items-center justify-center">
              {posCode}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-between h-full relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex justify-between items-start mb-2 z-20">
        <div>
          <h3 className="font-display text-xs font-black text-slate-350 tracking-wider uppercase flex items-center gap-1.5">
            🟢 {isEn ? 'PUSINGBASE INFOGRAPHIC FIELD' : 'INFOGRAFIK PADANG PUSINGBASE'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
            {isEn 
              ? `Defending Lineup: ${defendingTeam.name}` 
              : `Pemadang Aktif: Pasukan ${defendingTeam.name}`}
          </p>
        </div>
        <div className="group relative">
          <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          <div className="absolute right-0 top-6 w-56 p-2 bg-slate-950 text-slate-300 text-[10px] rounded-lg shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {isEn
              ? 'Click base diamonds to add/remove runners. Recommended for stolen bases or tags.'
              : 'Klik tapak diamond untuk tambah/buang pelari. Sesuai untuk curi tapak.'}
          </div>
        </div>
      </div>

      {/* Softball Diamond Diagram */}
      <div className="relative w-80 h-80 md:w-85 md:h-85 bg-emerald-950/20 rounded-full border-4 border-slate-800/80 flex items-center justify-center shadow-inner mt-2 overflow-hidden">
        {/* Grass outfield/infield patterns */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-teal-950/25 to-emerald-950/30" />
        
        {/* Clay infield brown/amber dirt track */}
        <div className="absolute w-[184px] h-[184px] md:w-[210px] md:h-[210px] rotate-45 border-4 border-amber-900/25 bg-emerald-900/25" />

        {/* Chalk paths connecting bases */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" viewBox="0 0 100 100">
          <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#64748b" strokeWidth="0.75" strokeDasharray="2 1" />
        </svg>

        {/* Home Plate (Bottom side of diamond) */}
        <div className="absolute translate-y-[84px] md:translate-y-[98px] z-10">
          <div className="w-6 h-6 bg-slate-100 relative shadow-md">
            <div className="absolute top-full left-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[8px] border-t-slate-100" />
          </div>
        </div>

        {/* ========================================================
            AUTOMATED FIELD PLAYER INDICATORS (POSITIONS SYSTEM)
            ========================================================= */}
        {renderFielder('P', 'top-[50%] left-[50%] -translate-x-1/2 -translate-y-[26px]')}
        {renderFielder('C', 'bottom-[14%] left-1/2 -translate-x-1/2 bg-slate-900/30 rounded-lg p-px')}
        
        {renderFielder('1B', 'top-[55%] left-[81%] -translate-x-1/2')}
        {renderFielder('2B', 'top-[36%] left-[64%] -translate-x-1/2')}
        {renderFielder('3B', 'top-[55%] left-[19%] -translate-x-1/2')}
        {renderFielder('SS', 'top-[36%] left-[36%] -translate-x-1/2')}
        
        {renderFielder('LF', 'top-[16%] left-[16%]')}
        {renderFielder('CF', 'top-[8%] left-1/2 -translate-x-1/2')}
        {renderFielder('RF', 'top-[16%] right-[16%]')}
        {gameState.gameMode !== 'fastpitch' && renderFielder('SF', 'top-[22%] left-1/2 -translate-x-1/2 bg-indigo-500/5 rounded-full p-0.5')}

        {/* ========================================================
            BUTTONS: INTERACTIVE BASE PLATES (RUNNER OVERLAYS)
            ========================================================= */}
        
        {/* 2nd Base (Top) */}
        <button
          type="button"
          id="base-2nd-btn"
          onClick={() => onToggleBase('second')}
          className={`absolute -translate-y-[84px] md:-translate-y-[98px] w-8 h-8 rotate-45 flex items-center justify-center transition-all duration-300 z-30 focus:outline-none cursor-pointer ${
            runners.second
              ? 'bg-emerald-400 border-2 border-emerald-300 shadow-lg shadow-emerald-400/50 scale-105 animate-pulse'
              : 'bg-slate-100 border border-slate-300 hover:bg-slate-200'
          }`}
          title={isEn ? 'Second Base (2B)' : 'Tapak Kedua (2B)'}
        >
          <span className="-rotate-45 text-[9px] font-black text-slate-900 select-none">
            {runners.second ? 'ON' : '2B'}
          </span>
        </button>

        {/* 1st Base (Right) */}
        <button
          type="button"
          id="base-1st-btn"
          onClick={() => onToggleBase('first')}
          className={`absolute translate-x-[84px] md:translate-x-[98px] w-8 h-8 rotate-45 flex items-center justify-center transition-all duration-300 z-30 focus:outline-none cursor-pointer ${
            runners.first
              ? 'bg-emerald-400 border-2 border-emerald-300 shadow-lg shadow-emerald-400/50 scale-105 animate-pulse'
              : 'bg-slate-100 border border-slate-300 hover:bg-slate-200'
          }`}
          title={isEn ? 'First Base (1B)' : 'Tapak Pertama (1B)'}
        >
          <span className="-rotate-45 text-[9px] font-black text-slate-900 select-none">
            {runners.first ? 'ON' : '1B'}
          </span>
        </button>

        {/* 3rd Base (Left) */}
        <button
          type="button"
          id="base-3rd-btn"
          onClick={() => onToggleBase('third')}
          className={`absolute -translate-x-[84px] md:-translate-x-[98px] w-8 h-8 rotate-45 flex items-center justify-center transition-all duration-300 z-30 focus:outline-none cursor-pointer ${
            runners.third
              ? 'bg-emerald-400 border-2 border-emerald-300 shadow-lg shadow-emerald-400/50 scale-105 animate-pulse'
              : 'bg-slate-100 border border-slate-300 hover:bg-slate-200'
          }`}
          title={isEn ? 'Third Base (3B)' : 'Tapak Ketiga (3B)'}
        >
          <span className="-rotate-45 text-[9px] font-black text-slate-900 select-none">
            {runners.third ? 'ON' : '3B'}
          </span>
        </button>
      </div>

      {/* Runner Status Indicators */}
      <div className="w-full flex gap-1.5 justify-center mt-4 z-20">
        <span
          className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold transition-all border ${
            runners.first
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-extrabold shadow-sm'
              : 'bg-slate-800/40 text-slate-600 border-transparent'
          }`}
        >
          {isEn ? '1st Base' : 'Tapak-1'}
        </span>
        <span
          className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold transition-all border ${
            runners.second
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-extrabold shadow-sm'
              : 'bg-slate-800/40 text-slate-600 border-transparent'
          }`}
        >
          {isEn ? '2nd Base' : 'Tapak-2'}
        </span>
        <span
          className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold transition-all border ${
            runners.third
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-extrabold shadow-sm'
              : 'bg-slate-800/40 text-slate-600 border-transparent'
          }`}
        >
          {isEn ? '3rd Base' : 'Tapak-3'}
        </span>
      </div>

      {/* Embedded Copyright on Field widget */}
      <div className="text-[8px] font-mono text-slate-600 mt-2 tracking-widest text-center select-none">
        © 2026 NAIM OSMAN • PUSINGBASE GRAPHICS SYSTEM
      </div>
    </div>
  );
}
