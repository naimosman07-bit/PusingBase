/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Team, GameState, Language } from '../types';
import { TRANSLATIONS, SOFTBALL_POSITIONS, PRESET_AWAY_PLAYERS, PRESET_HOME_PLAYERS } from '../utils';
import { Users, UserPlus, Play, RotateCcw, Shield, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
// @ts-ignore
import appIcon from '../assets/images/app_icon_1781079668281.png';

interface RosterSetupProps {
  gameState: GameState;
  onChangeGameState: (updater: (prev: GameState) => GameState) => void;
  onStartGame: () => void;
  language: Language;
}

export default function RosterSetup({ gameState, onChangeGameState, onStartGame, language }: RosterSetupProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const [activeTab, setActiveTab ] = useState<'away' | 'home'>('away');
  const [showInstallGuide, setShowInstallGuide] = useState(false);

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

  const handleGameModeChange = (mode: 'fastpitch' | 'slowpitch') => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      updated.gameMode = mode;
      
      const count = 10;
      
      // Keep batting order aligned with the exact roster slice length
      updated.awayTeam.battingOrder = updated.awayTeam.roster.slice(0, count).map(p => p.id);
      updated.homeTeam.battingOrder = updated.homeTeam.roster.slice(0, count).map(p => p.id);
      
      // Clean up position conflicts for field position
      if (mode === 'fastpitch') {
        updated.awayTeam.roster.forEach((p, idx) => {
          if (p.position === 'SF') p.position = 'DP';
          if (idx === 9 && (p.position === 'DH' || p.position === 'DP' || p.position === 'SF')) {
            p.position = 'DP';
          }
        });
        updated.homeTeam.roster.forEach((p, idx) => {
          if (p.position === 'SF') p.position = 'DP';
          if (idx === 9 && (p.position === 'DH' || p.position === 'DP' || p.position === 'SF')) {
            p.position = 'DP';
          }
        });
      } else {
        // If slowpitch, ensure we have SF assigned back to the 10th player to make it convenient
        updated.awayTeam.roster.forEach((p, idx) => {
          if (p.position === 'DP') p.position = 'SF';
        });
        if (updated.awayTeam.roster[9] && (updated.awayTeam.roster[9].position === 'DH' || updated.awayTeam.roster[9].position === 'DP' || updated.awayTeam.roster[9].position === 'SF')) {
          updated.awayTeam.roster[9].position = 'SF';
        }
        
        updated.homeTeam.roster.forEach((p, idx) => {
          if (p.position === 'DP') p.position = 'SF';
        });
        if (updated.homeTeam.roster[9] && (updated.homeTeam.roster[9].position === 'DH' || updated.homeTeam.roster[9].position === 'DP' || updated.homeTeam.roster[9].position === 'SF')) {
          updated.homeTeam.roster[9].position = 'SF';
        }
      }
      return updated;
    });
  };

  // Reset to default presets
  const resetToPresets = () => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      updated.awayTeam = {
        name: 'Pendang Softball Club',
        roster: JSON.parse(JSON.stringify(PRESET_AWAY_PLAYERS)),
        battingOrder: PRESET_AWAY_PLAYERS.slice(0, 10).map(p => p.id),
      };
      updated.homeTeam = {
        name: 'Red Stallions FC',
        roster: JSON.parse(JSON.stringify(PRESET_HOME_PLAYERS)),
        battingOrder: PRESET_HOME_PLAYERS.slice(0, 10).map(p => p.id),
      };
      updated.currentPitcherId = {
        away: 'a9',
        home: 'h9',
      };
      if (updated.gameMode === 'fastpitch') {
        updated.awayTeam.roster.forEach((p, idx) => {
          if (p.position === 'SF') p.position = 'DP';
          if (idx === 9) p.position = 'DP';
        });
        updated.homeTeam.roster.forEach((p, idx) => {
          if (p.position === 'SF') p.position = 'DP';
          if (idx === 9) p.position = 'DP';
        });
      }
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
        <div className="flex items-center gap-4">
          <img 
            src={appIcon} 
            alt="Pendang Softball icon" 
            className="w-14 h-14 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10 object-cover shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-100 flex items-center gap-2">
              {t.teamSetup}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isEn
                ? 'Customize team lineups, numbers, and positions • © 2026 Naim Osman'
                : 'Sediakan nama pasukan, nombor jersi dan posisi • © 2026 Naim Osman'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowInstallGuide(!showInstallGuide)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition duration-200 border shadow ${
              showInstallGuide 
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {isEn ? 'Install App Icon' : 'Pasang Ikon App'}
            {showInstallGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={resetToPresets}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition duration-200 border border-slate-700 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isEn ? 'Reset to Defaults' : 'Guna Praset Laluan'}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Installation Guide */}
      {showInstallGuide && (
        <div className="bg-slate-950/80 border border-amber-500/30 p-5 rounded-2xl mb-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2 shrink-0 bg-slate-900 p-4 rounded-xl border border-slate-800 w-full md:w-auto">
              <img 
                src={appIcon} 
                alt="App Icon Preview" 
                className="w-20 h-20 rounded-2xl border border-amber-400 shadow-lg shadow-black object-cover" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-mono font-bold text-amber-400">PusingBase</span>
              <span className="text-[10px] text-slate-500">Android & iOS Icon</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                📲 {isEn ? "How to install to Desktop / Mobile Screen" : "Cara Pasang Ikon Aplikasi pada Telefon / Desktop"}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* iOS Instructions */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <h5 className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
                    🍏 Apple iOS (Safari)
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium">
                    <li>{isEn ? "Open this app in native Safari browser." : "Buka aplikasi ini dalam pelayar Safari."}</li>
                    <li>{isEn ? "Tap the Share button at the bottom." : "Tekan butang Kongsi (Share) di bahagian bawah."}</li>
                    <li>{isEn ? "Select 'Add to Home Screen'." : "Pilih 'Tambah ke Skrin Utama / Add to Home Screen'."}</li>
                    <li>{isEn ? "Name it 'PusingBase' and tap Add." : "Namakan 'PusingBase' dan tekan Tambah."}</li>
                  </ol>
                </div>
                
                {/* Android Instructions */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <h5 className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
                    🤖 Android (Chrome)
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium">
                    <li>{isEn ? "Open this app in Chrome browser." : "Buka aplikasi ini dalam Google Chrome."}</li>
                    <li>{isEn ? "Tap the 3 vertical dots at the top-right." : "Tekan butang 3 titik menegak di penjuru atas-kanan."}</li>
                    <li>{isEn ? "Select 'Add to Home screen' or 'Install app'." : "Pilih 'Tambah ke skrin Utama / Add to Home screen'."}</li>
                    <li>{isEn ? "Confirm the installer pop-up." : "Sahkan pemasangan pada tetingkap timbul."}</li>
                  </ol>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 mt-2">
                * {isEn 
                  ? "Note: Make sure to open the App from the mobile browser directly (not inside the social media parent app) to enable Add to Home Screen." 
                  : "Nota: Pastikan anda membuka aplikasi ini terus dari pelayar mudah alih (bukan dari dalam app media sosial) untuk membolehkan butang 'Tambah ke Skrin Utama'."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Mode Selection Block */}
      <div id="game-format-selector-box" className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            🥎 {isEn ? "Select Softball Game Format" : "Pilihan Format Permainan Softball"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isEn
              ? "Fastpitch specifies 9 fielders (no Rover). Slowpitch specifies 10 fielders (including Rover/SF)."
              : "Fastpitch dimain 9 orang sahaja (tiada Rover). Slowpitch dimain 10 orang termasuk Rover/SF."}
          </p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            id="btn-toggle-fastpitch"
            onClick={() => handleGameModeChange('fastpitch')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              gameState.gameMode === 'fastpitch'
                ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            ⚡ {isEn ? "Fastpitch (9 Players)" : "Fastpitch (9 Pemain)"}
          </button>
          <button
            type="button"
            id="btn-toggle-slowpitch"
            onClick={() => handleGameModeChange('slowpitch')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              gameState.gameMode === 'slowpitch' || !gameState.gameMode
                ? 'bg-indigo-600 text-white shadow font-extrabold'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            🐢 {isEn ? "Slowpitch (10 Players)" : "Slowpitch (10 Pemain)"}
          </button>
        </div>
      </div>
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
            <React.Fragment key={player.id}>
              {/* Starters Section Header */}
              {idx === 0 && (
                <div className="bg-slate-900/90 px-4 py-2 text-[11px] font-bold text-indigo-400 font-mono flex items-center gap-2 border-b border-slate-800">
                  <span>🏏 {isEn ? "Starting Lineup (Starters)" : "Kesebelasan Utama (Starters)"}</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-sans px-1.5 py-0.2 rounded">
                    {gameState.gameMode === 'fastpitch' 
                      ? (isEn ? "10 Batters (9 Defense + 1 DP)" : "10 Pemukul (9 Padang + 1 DP)") 
                      : (isEn ? "10 Batters" : "10 Pemukul Pertama")}
                  </span>
                </div>
              )}
              {/* Reserves Section Header */}
              {idx === 10 && (
                <div className="bg-slate-900/90 px-4 py-2 text-[11px] font-bold text-amber-400 font-mono flex items-center gap-2 border-b border-slate-800 border-t border-slate-800">
                  <span>📋 {isEn ? "Reserves (Bench)" : "Barisan Simpanan (Reserves)"}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 font-sans px-1.5 py-0.2 rounded">
                    {isEn ? "Ready for Substitution" : "Sedia Ditukar Masuk"}
                  </span>
                </div>
              )}
              
              <div className="p-3 flex flex-wrap md:flex-nowrap items-center gap-3 hover:bg-slate-900/30 transition-colors">
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
            </React.Fragment>
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
