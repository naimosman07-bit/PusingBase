/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, Language, Player } from '../types';
import { TRANSLATIONS } from '../utils';
import { RotateCcw, AlertTriangle, Disc, Play, Save, Skull, Award } from 'lucide-react';

interface LiveControlsProps {
  gameState: GameState;
  onLogStrike: () => void;
  onLogBall: () => void;
  onLogFoul: () => void;
  onLogHit: (bases: 1 | 2 | 3 | 4) => void;
  onLogOut: (outType: 'strikeout' | 'groundout' | 'flyout') => void;
  onLogWalk: () => void;
  onLogError: () => void;
  onResetCount: () => void;
  onClearBases: () => void;
  onUndo: () => void;
  onEndGame: () => void;
  language: Language;
}

export default function LiveControls({
  gameState,
  onLogStrike,
  onLogBall,
  onLogFoul,
  onLogHit,
  onLogOut,
  onLogWalk,
  onLogError,
  onResetCount,
  onClearBases,
  onUndo,
  onEndGame,
  language,
}: LiveControlsProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const {
    balls,
    strikes,
    outs,
    isTopInning,
    awayTeam,
    homeTeam,
    currentBatterIndex,
    currentPitcherId,
  } = gameState;

  // Identify active batter
  const activeBattingTeam = isTopInning ? awayTeam : homeTeam;
  const currentBatterIdx = isTopInning ? currentBatterIndex.away : currentBatterIndex.home;
  const activeBatterId = activeBattingTeam.battingOrder[currentBatterIdx % activeBattingTeam.roster.length];
  const activeBatter = activeBattingTeam.roster.find(p => p.id === activeBatterId);

  // Identify active pitcher (opposing team)
  const activeDefensiveTeam = isTopInning ? homeTeam : awayTeam;
  const pitcherId = isTopInning ? currentPitcherId.home : currentPitcherId.away;
  const activePitcher = activeDefensiveTeam.roster.find(p => p.id === pitcherId) 
    || activeDefensiveTeam.roster.find(p => p.position === 'P') 
    || activeDefensiveTeam.roster[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Active Batter & Pitcher Dual-Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* At Bat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow">
          <div>
            <div className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
              {isEn ? 'AT BAT (BATTING)' : 'SEKANG MEMUKUL'}
            </div>
            {activeBatter ? (
              <div className="mt-1.5">
                <span className="font-display text-base font-bold text-slate-100">
                  {activeBatter.name || `${isEn ? 'Batter' : 'Pemukul'} #${(currentBatterIdx % activeBattingTeam.roster.length) + 1}`}
                </span>
                <span className="ml-2 font-mono text-xs font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {activeBatter.number ? `#${activeBatter.number}` : '-'}
                </span>
                <div className="text-[10px] font-mono font-medium text-slate-400 mt-1">
                  Pos: {activeBatter.position} | {isEn ? 'Hits' : 'Pukulan'}: {activeBatter.hits}/{activeBatter.atBats} AB | Runs: {activeBatter.runs} | RBIs: {activeBatter.rbis}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 mt-2 italic">No active batter</div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 text-sm font-semibold font-mono">BAT</span>
          </div>
        </div>

        {/* On Mound */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow">
          <div>
            <div className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
              {isEn ? 'ON MOUND (PITCHER)' : 'PADA MEMBALING'}
            </div>
            {activePitcher ? (
              <div className="mt-1.5">
                <span className="font-display text-base font-bold text-slate-100">
                  {activePitcher.name || `${isEn ? 'Pitcher' : 'Pelempar'}`}
                </span>
                <span className="ml-2 font-mono text-xs font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {activePitcher.number ? `#${activePitcher.number}` : '-'}
                </span>
                <div className="text-[10px] font-mono font-medium text-slate-400 mt-1">
                  {isEn ? 'Pitches' : 'Balingan'}: {activePitcher.pitchesThrown} (S: {activePitcher.strikesThrown} / B: {activePitcher.ballsThrown}) | {isEn ? 'RA' : 'L.Kena'}: {activePitcher.runsAllowed}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 mt-2 italic">No active pitcher</div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-indigo-400 text-sm font-semibold font-mono">PCH</span>
          </div>
        </div>
      </div>

      {/* Visual Game Counts Dashboard LED Indicators */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* BALLS COUNT */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-widest font-black text-slate-400 uppercase mb-2">
              {t.balls.toUpperCase()}
            </span>
            <div className="flex gap-1.5 justify-center">
              {[1, 2, 3].map(item => (
                <div
                  key={item}
                  className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center font-mono text-[9px] font-extrabold ${
                    balls >= item
                      ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40 text-slate-950 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  B
                </div>
              ))}
            </div>
            <span className="text-xl font-mono font-black text-emerald-400 mt-2">{balls}</span>
          </div>

          {/* STRIKES COUNT */}
          <div className="flex flex-col items-center border-l border-r border-slate-800/80 px-2">
            <span className="text-[10px] font-mono tracking-widest font-black text-slate-400 uppercase mb-2">
              {t.strikes.toUpperCase()}
            </span>
            <div className="flex gap-1.5 justify-center">
              {[1, 2].map(item => (
                <div
                  key={item}
                  className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center font-mono text-[9px] font-extrabold ${
                    strikes >= item
                      ? 'bg-orange-500 border-orange-400 shadow-md shadow-orange-500/40 text-slate-950 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  S
                </div>
              ))}
            </div>
            <span className="text-xl font-mono font-black text-orange-400 mt-2">{strikes}</span>
          </div>

          {/* OUTS COUNT */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-widest font-black text-slate-400 uppercase mb-2">
              {t.outs.toUpperCase()}
            </span>
            <div className="flex gap-1.5 justify-center">
              {[1, 2].map(item => (
                <div
                  key={item}
                  className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center font-mono text-[9px] font-extrabold ${
                    outs >= item
                      ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/40 text-slate-900 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  O
                </div>
              ))}
            </div>
            <span className="text-xl font-mono font-black text-rose-500 mt-2">{outs}</span>
          </div>
        </div>
      </div>

      {/* QUICK PITCH & COUNT ADVANCERS (High Impact Vibrant Buttons) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5 shadow-md">
        <div className="text-[10px] font-mono tracking-widest font-black text-slate-400 uppercase">
          {isEn ? 'PITCH ACTION PAD' : 'PAD TINDAKAN BALINGAN'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ball Button - Vibrant green plate */}
          <button
            type="button"
            id="btn-pitch-ball"
            onClick={onLogBall}
            className="bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-4 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 focus:outline-none cursor-pointer border-none"
          >
            <span className="text-lg font-black uppercase tracking-tight">{isEn ? 'BALL' : 'BOLA'}</span>
            <span className="text-[9px] opacity-75 font-bold uppercase tracking-wider font-mono">Green Plate / +1 B</span>
          </button>

          {/* Strike Button - Vibrant orange plate */}
          <button
            type="button"
            id="btn-pitch-strike"
            onClick={onLogStrike}
            className="bg-orange-600 hover:bg-orange-500 text-white py-4 px-4 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 focus:outline-none cursor-pointer border-none"
          >
            <span className="text-lg font-black uppercase tracking-tight">{isEn ? 'STRIKE' : 'STRIK'}</span>
            <span className="text-[9px] opacity-75 font-bold uppercase tracking-wider font-mono">Swing-Looking / +1 S</span>
          </button>

          {/* Foul Button - Vibrant Slate plate */}
          <button
            type="button"
            id="btn-pitch-foul"
            onClick={onLogFoul}
            className="bg-slate-800 hover:bg-slate-705 text-white border border-slate-700 py-4 px-4 rounded-xl flex flex-col items-center justify-center shadow-md transition-all active:scale-95 focus:outline-none cursor-pointer"
          >
            <span className="text-lg font-black uppercase tracking-tight">{isEn ? 'FOUL' : 'FOUL'}</span>
            <span className="text-[9px] opacity-75 font-bold uppercase tracking-wider font-mono">{isEn ? 'Foul Pitch' : 'Balingan Foul'}</span>
          </button>
        </div>
      </div>

      {/* POSITIVE HITS / BATTING SUCCESS */}
      <div className="bg-slate-905 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
        <div className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
          {isEn ? 'BATTER SUCCESSFUL HITS' : 'KEJAYAAN PEMUKUL (HITS)'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Single */}
          <button
            type="button"
            id="btn-hit-1b"
            onClick={() => onLogHit(1)}
            className="py-3 px-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/20 hover:border-sky-400 rounded-xl text-xs font-bold transition duration-150 flex flex-col items-center gap-0.5 active:scale-95"
          >
            <span className="text-[14px]">⚾</span>
            <span className="font-display text-[11px] font-bold text-center truncate w-full">{t.single}</span>
          </button>

          {/* Double */}
          <button
            type="button"
            id="btn-hit-2b"
            onClick={() => onLogHit(2)}
            className="py-3 px-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 hover:border-cyan-400 rounded-xl text-xs font-bold transition duration-150 flex flex-col items-center gap-0.5 active:scale-95"
          >
            <span className="text-[14px]">🥎</span>
            <span className="font-display text-[11px] font-bold text-center truncate w-full">{t.double}</span>
          </button>

          {/* Triple */}
          <button
            type="button"
            id="btn-hit-3b"
            onClick={() => onLogHit(3)}
            className="py-3 px-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-slate-950 border border-indigo-500/20 hover:border-indigo-400 rounded-xl text-xs font-bold transition duration-150 flex flex-col items-center gap-0.5 active:scale-95"
          >
            <span className="text-[14px]">🔥</span>
            <span className="font-display text-[11px] font-bold text-center truncate w-full">{t.triple}</span>
          </button>

          {/* HR */}
          <button
            type="button"
            id="btn-hit-hr"
            onClick={() => onLogHit(4)}
            className="py-3 px-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 hover:border-amber-400 rounded-xl text-xs font-bold transition duration-150 flex flex-col items-center gap-0.5 active:scale-95"
          >
            <span className="text-[14px]">🪐</span>
            <span className="font-display text-[11px] font-bold text-center truncate w-full">{t.hr}</span>
          </button>
        </div>
      </div>

      {/* OUTS & SPECIAL LOGGING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Play Outs */}
        <div className="bg-slate-905 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          <div className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5 text-rose-400">
            <Skull className="w-3.5 h-3.5" />
            {isEn ? 'LOG FIELD OUTS' : 'LOG MATI PADANG'}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {/* Strikeout */}
            <button
              type="button"
              id="btn-out-so"
              onClick={() => onLogOut('strikeout')}
              className="py-2.5 px-0.5 bg-rose-500/10 hover:bg-rose-600/30 text-rose-300 border border-rose-500/20 hover:border-rose-500 rounded-lg text-[10px] font-bold transition duration-100 flex flex-col items-center justify-center active:scale-95"
            >
              <span>Strikeout</span>
              <span className="font-mono text-[8px] opacity-60">K-Out</span>
            </button>

            {/* Flyout */}
            <button
              type="button"
              id="btn-out-fo"
              onClick={() => onLogOut('flyout')}
              className="py-2.5 px-0.5 bg-rose-500/10 hover:bg-rose-600/30 text-rose-300 border border-rose-500/20 hover:border-rose-500 rounded-lg text-[10px] font-bold transition duration-100 flex flex-col items-center justify-center active:scale-95"
            >
              <span>{isEn ? 'Fly Out' : 'Mati Sasar'}</span>
              <span className="font-mono text-[8px] opacity-60">F-Out</span>
            </button>

            {/* Groundout */}
            <button
              type="button"
              id="btn-out-go"
              onClick={() => onLogOut('groundout')}
              className="py-2.5 px-0.5 bg-rose-500/10 hover:bg-rose-600/30 text-rose-300 border border-rose-500/20 hover:border-rose-500 rounded-lg text-[10px] font-bold transition duration-100 flex flex-col items-center justify-center active:scale-95"
            >
              <span>{isEn ? 'Ground Out' : 'Mati Padang'}</span>
              <span className="font-mono text-[8px] opacity-60">G-Out</span>
            </button>
          </div>
        </div>

        {/* Walk / Error Base Advancements */}
        <div className="bg-slate-905 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          <div className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5 text-amber-400">
            <Award className="w-3.5 h-3.5" />
            {isEn ? 'SPECIAL BASE ADVANCERS' : 'AMBIL TAPAK KHAS'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Base on balls (Walk) */}
            <button
              type="button"
              id="btn-walk-bb"
              onClick={onLogWalk}
              className="py-2.5 bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 border border-teal-500/20 rounded-lg text-[11px] font-bold transition duration-100 flex items-center justify-center gap-1 active:scale-95"
            >
              <span>🚶</span>
              <span>{t.baseOnBalls}</span>
            </button>

            {/* Reach on Error */}
            <button
              type="button"
              id="btn-reach-error"
              onClick={onLogError}
              className="py-2.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 rounded-lg text-[11px] font-bold transition duration-100 flex items-center justify-center gap-1 active:scale-95"
            >
              <span>⚠️</span>
              <span>{t.reachError}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONS & UNDO & FINISH */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Reset Count */}
          <button
            type="button"
            onClick={onResetCount}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition border border-slate-700 font-sans"
            title="Reset current balls & strikes count"
          >
            {t.resetCount}
          </button>

          {/* Clear bases */}
          <button
            type="button"
            onClick={onClearBases}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition border border-slate-700 font-sans"
            title="Remove all active runners"
          >
            {t.clearBases}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            type="button"
            id="btn-undo-action"
            onClick={onUndo}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg text-[11px] font-semibold transition border border-slate-700 font-sans"
          >
            <RotateCcw className="w-3 h-3" />
            {t.undo}
          </button>

          {/* End Game Button */}
          <button
            type="button"
            id="btn-end-game-match"
            onClick={onEndGame}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold tracking-wide uppercase transition hover:shadow-lg hover:shadow-red-500/20 active:scale-95 font-sans"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            {t.endGame}
          </button>
        </div>
      </div>
    </div>
  );
}
