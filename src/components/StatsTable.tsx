/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Team, Player, Language } from '../types';
import { TRANSLATIONS } from '../utils';
import { Award, Zap, TrendingUp } from 'lucide-react';

interface StatsTableProps {
  awayTeam: Team;
  homeTeam: Team;
  language: Language;
}

export default function StatsTable({ awayTeam, homeTeam, language }: StatsTableProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'away' | 'home'>('away');

  const selectedTeam = activeTab === 'away' ? awayTeam : homeTeam;

  // Calculate Batting Average
  const formatAVG = (hits: number, ab: number) => {
    if (ab === 0) return '---';
    const avg = hits / ab;
    if (avg === 1) return '1.000';
    return avg.toFixed(3).substring(1); // e.g. .333
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      {/* Tab Selectors & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            {isEn ? 'INDIVIDUAL PLAYER STATS' : 'STATISTIK INDIVIDU PEMAIN'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn ? "Live game stats tracking for batting and pitching" : "Status masa nyata untuk pukulan dan balingan"}
          </p>
        </div>

        {/* Home/Away team state switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('away')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'away'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {awayTeam.name || 'Away'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'home'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {homeTeam.name || 'Home'}
          </button>
        </div>
      </div>

      {/* Batting Stats Section */}
      <div>
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          {isEn ? 'BATTING PERFORMANCE' : 'PRESTASI MEMUKUL'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono font-semibold text-slate-500 uppercase">
                <th className="py-2 pr-2 font-bold text-slate-400">{isEn ? 'PLAYER' : 'PEMAIN'}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.ab}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.r}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.h}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.rbi}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.so}</th>
                <th className="px-2 py-2 text-center text-slate-400">{t.bb}</th>
                <th className="pl-3 py-2 text-right text-indigo-400 font-bold">{t.avg}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {selectedTeam.roster.map(player => (
                <tr key={player.id} className="hover:bg-slate-800/10 text-slate-300">
                  <td className="py-2.5 pr-2 font-sans font-semibold text-slate-200 truncate max-w-[120px]" title={player.name || (isEn ? 'Player' : 'Pemain')}>
                    <span className="text-slate-500 mr-1.5">{player.number ? `#${player.number}` : '#—'}</span>
                    {player.name || `${isEn ? 'Player' : 'Pemain'} (${player.position})`}
                  </td>
                  <td className="px-2 py-2.5 text-center font-medium bg-slate-950/20">{player.atBats}</td>
                  <td className="px-2 py-2.5 text-center text-slate-200">{player.runs}</td>
                  <td className="px-2 py-2.5 text-center text-slate-200 font-bold">{player.hits}</td>
                  <td className="px-2 py-2.5 text-center text-slate-200">{player.rbis}</td>
                  <td className="px-2 py-2.5 text-center text-slate-500">{player.strikeouts}</td>
                  <td className="px-2 py-2.5 text-center text-slate-400">{player.walks}</td>
                  <td className="pl-3 py-2.5 text-right font-bold text-indigo-300">{formatAVG(player.hits, player.atBats)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitching Stats Section (Filter players who have pitched or standard P position) */}
      <div className="border-t border-slate-800/60 pt-4 mt-1">
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-sky-400" />
          {isEn ? 'PITCHING PERFORMANCE' : 'PRESTASI BALINGAN'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono font-semibold text-slate-500 uppercase">
                <th className="py-2 pr-2 font-bold text-slate-400">{isEn ? 'PITCHER' : 'PENGHANTAR'}</th>
                <th className="px-2 py-2 text-center text-slate-400">{isEn ? 'TOTAL' : 'JUMLAH'}</th>
                <th className="px-2 py-2 text-center text-emerald-500">{t.strikesThrown}</th>
                <th className="px-2 py-2 text-center text-amber-500">{t.ballsThrown}</th>
                <th className="px-2 py-2 text-center text-rose-500">{t.runsAllowed}</th>
                <th className="px-2 py-2 text-center text-slate-400">{isEn ? 'RATIO' : 'NISBAH'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {selectedTeam.roster
                .filter(p => p.pitchesThrown > 0 || p.position === 'P')
                .map(player => {
                  const total = player.pitchesThrown;
                  const ratio = total > 0 ? ((player.strikesThrown / total) * 100).toFixed(0) + '%' : '0%';
                  return (
                    <tr key={player.id} className="hover:bg-slate-800/10 text-slate-300">
                      <td className="py-2.5 pr-2 font-sans font-semibold text-slate-200 truncate max-w-[120px]">
                        <span className="text-slate-500 mr-1.5">{player.number ? `#${player.number}` : '#—'}</span>
                        {player.name || `${isEn ? 'Player' : 'Pemain'} (${player.position})`}
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold bg-slate-950/20">{total}</td>
                      <td className="px-2 py-2.5 text-center text-emerald-400">{player.strikesThrown}</td>
                      <td className="px-2 py-2.5 text-center text-amber-400">{player.ballsThrown}</td>
                      <td className="px-2 py-2.5 text-center text-rose-400 font-bold">{player.runsAllowed}</td>
                      <td className="px-2 py-2.5 text-center text-slate-500 text-[11px]">{ratio} S</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
