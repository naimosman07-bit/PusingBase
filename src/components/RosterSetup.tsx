/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Team, GameState, Language } from '../types';
import { TRANSLATIONS, SOFTBALL_POSITIONS, PRESET_AWAY_PLAYERS, PRESET_HOME_PLAYERS } from '../utils';
import { Users, UserPlus, Play, RotateCcw, Shield } from 'lucide-react';

interface RosterSetupProps {
  gameState: GameState;
  onChangeGameState: (updater: (prev: GameState) => GameState) => void;
  onStartGame: () => void;
  language: Language;
}

export default function RosterSetup({ gameState, onChangeGameState, onStartGame, language }: RosterSetupProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'away' | 'home'>('away');

  // Change team name helper
  const handleTeamNameChange = (side: 'away' | 'home', name: string) => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      if (side === 'away') {
        updated.awayTeam.name = name;
      } else {
        updated.homeTeam.name = name;
      }
      return updated;
    });
  };

  // Change player field helper
  const handlePlayerChange = (
    side: 'away' | 'home',
    playerIndex: number,
    field: keyof Player,
    value: string
  ) => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      const team = side === 'away' ? updated.awayTeam : updated.homeTeam;
      const player = team.roster[playerIndex];
      if (player) {
        (player as any)[field] = value;
      }
      return updated;
    });
  };

  // Add a player to roster
  const addPlayer = (side: 'away' | 'home') => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      const team = side === 'away' ? updated.awayTeam : updated.homeTeam;
      const id = side[0] + '_custom_' + Date.now();
      const newPlayer: Player = {
        id,
        name: isEn ? `Player ${team.roster.length + 1}` : `Pemain ${team.roster.length + 1}`,
        number: String(Math.floor(Math.random() * 99) + 1),
        position: 'DH',
        atBats: 0, runs: 0, hits: 0, rbis: 0, strikeouts: 0, walks: 0,
        pitchesThrown: 0, strikesThrown: 0, ballsThrown: 0, strikeoutsThrown: 0, walksThrown: 0, runsAllowed: 0
      };

      team.roster.push(newPlayer);
      team.battingOrder.push(id);
      return updated;
    });
  };

  // Remove player from roster
  const removePlayer = (side: 'away' | 'home', index: number) => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      const team = side === 'away' ? updated.awayTeam : updated.homeTeam;
      if (team.roster.length <= 1) return prev; // Keep at least one player
      
      const playerId = team.roster[index].id;
      team.roster.splice(index, 1);
      team.battingOrder = team.battingOrder.filter(id => id !== playerId);
      return updated;
    });
  };

  // Reset to default presets
  const resetToPresets = () => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      updated.awayTeam = {
        name: 'Harimau Softball Club',
        roster: JSON.parse(JSON.stringify(PRESET_AWAY_PLAYERS)),
        battingOrder: PRESET_AWAY_PLAYERS.map(p => p.id),
      };
      updated.homeTeam = {
        name: 'Red Stallions FC',
        roster: JSON.parse(JSON.stringify(PRESET_HOME_PLAYERS)),
        battingOrder: PRESET_HOME_PLAYERS.map(p => p.id),
      };
      return updated;
    });
  };

  const currentTeam = activeTab === 'away' ? gameState.awayTeam : gameState.homeTeam;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Top buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-400" />
            {t.teamSetup}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isEn
              ? 'Customize team lineups, numbers, and positions • © 2026 Naim Osman'
              : 'Sediakan nama pasukan, nombor jersi dan posisi • © 2026 Naim Osman'}
          </p>
        </div>
        
        <button
          type="button"
          onClick={resetToPresets}
          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition duration-200 border border-slate-700 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isEn ? 'Reset to Defaults' : 'Guna Praset Laluan'}
        </button>
      </div>

      {/* Team Names configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Away Team name */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <label className="block text-xs font-semibold text-rose-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
            <span>{t.awayTeam}</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 font-mono px-2 py-0.5 rounded">AWAY</span>
          </label>
          <input
            type="text"
            id="away-team-name-input"
            value={gameState.awayTeam.name}
            onChange={(e) => handleTeamNameChange('away', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-rose-500 transition-colors"
            placeholder={isEn ? "Enter Away Team Name" : "Nama Pasukan Pelawat"}
          />
        </div>

        {/* Home Team name */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
            <span>{t.homeTeam}</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-mono px-2 py-0.5 rounded">HOME</span>
          </label>
          <input
            type="text"
            id="home-team-name-input"
            value={gameState.homeTeam.name}
            onChange={(e) => handleTeamNameChange('home', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder={isEn ? "Enter Home Team Name" : "Nama Pasukan Tuan Rumah"}
          />
        </div>
      </div>

      {/* Roster Tabs selection */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('away')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-200 ${
            activeTab === 'away'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {gameState.awayTeam.name || t.awayTeam} ({gameState.awayTeam.roster.length} {isEn ? 'Players' : 'Pemain'})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-200 ${
            activeTab === 'home'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {gameState.homeTeam.name || t.homeTeam} ({gameState.homeTeam.roster.length} {isEn ? 'Players' : 'Pemain'})
        </button>
      </div>

      {/* Roster Players List Edit Panel */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-800/80 overflow-hidden mb-8">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            {t.battingOrder} & {t.players}
          </span>
          <button
            type="button"
            onClick={() => addPlayer(activeTab)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/25 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition border border-indigo-500/30 font-sans"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isEn ? 'Add Player' : 'Tambah Pemain'}
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
          {currentTeam.roster.map((player, idx) => (
            <div key={player.id} className="p-3 flex flex-wrap md:flex-nowrap items-center gap-3 hover:bg-slate-900/30 transition-colors">
              {/* Order index badge */}
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono font-bold">
                {idx + 1}
              </div>

              {/* Player Name */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerChange(activeTab, idx, 'name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-slate-600 transition"
                  placeholder={t.name}
                />
              </div>

              {/* Player Uniform Number */}
              <div className="w-20">
                <input
                  type="text"
                  value={player.number}
                  onChange={(e) => handlePlayerChange(activeTab, idx, 'number', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono text-center focus:outline-none focus:border-slate-600 transition"
                  placeholder={t.number}
                  maxLength={3}
                />
              </div>

              {/* Player Position selection */}
              <div className="w-48">
                <select
                  value={player.position}
                  onChange={(e) => handlePlayerChange(activeTab, idx, 'position', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-slate-600 transition"
                >
                  {SOFTBALL_POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.value} - {isEn ? pos.labelEn : pos.labelMs}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove button */}
              <div>
                <button
                  type="button"
                  onClick={() => removePlayer(activeTab, idx)}
                  disabled={currentTeam.roster.length <= 1}
                  className="p-1 px-2.5 rounded-lg border border-slate-800 hover:border-red-500 hover:text-red-400 text-slate-500 transition text-xs"
                  title="Remove player"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onStartGame}
          className="w-full md:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 text-sm tracking-wide uppercase font-display"
        >
          <Play className="w-4 h-4 fill-white" />
          {t.startLiveGame}
        </button>
      </div>
    </div>
  );
}
