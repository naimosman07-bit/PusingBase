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
      
      const setupTeamMode = (team: any) => {
        if (mode === 'fastpitch') {
          // Fastpitch: SS, 2B, CF, 3B, 1B, LF, RF, C, DP, P for first 10 players
          const fastpitchPositions = ['SS', '2B', 'CF', '3B', '1B', 'LF', 'RF', 'C', 'DP', 'P'];
          team.roster.forEach((p: any, idx: number) => {
            if (idx < 10) {
              p.position = fastpitchPositions[idx];
            } else if (p.position === 'SF' || p.position === 'DP' || p.position === 'EP') {
              p.position = 'DH';
            }
          });
          // Exactly 9 batting spots: indices 0 to 8 (SS, 2B, CF, 3B, 1B, LF, RF, C, DP)
          team.battingOrder = team.roster.slice(0, 9).map((p: any) => p.id);
        } else {
          // Slowpitch: SS, 2B, CF, 3B, 1B, LF, RF, C, P, SF, EP for first 11 players
          const slowpitchPositions = ['SS', '2B', 'CF', '3B', '1B', 'LF', 'RF', 'C', 'P', 'SF', 'EP'];
          team.roster.forEach((p: any, idx: number) => {
            if (idx < 11) {
              p.position = slowpitchPositions[idx];
            } else if (p.position === 'DP') {
              p.position = 'DH';
            }
          });
          // Exactly 11 batting spots: indices 0 to 10
          team.battingOrder = team.roster.slice(0, 11).map((p: any) => p.id);
        }
      };

      setupTeamMode(updated.awayTeam);
      setupTeamMode(updated.homeTeam);
      
      // Update Pitcher references dynamically searching for 'P'
      const awayPitcher = updated.awayTeam.roster.find((p: any) => p.position === 'P');
      const homePitcher = updated.homeTeam.roster.find((p: any) => p.position === 'P');
      updated.currentPitcherId = {
        away: awayPitcher ? awayPitcher.id : (updated.awayTeam.roster[9]?.id || ''),
        home: homePitcher ? homePitcher.id : (updated.homeTeam.roster[9]?.id || ''),
      };

      return updated;
    });
  };

  // Reset to default presets
  const resetToPresets = () => {
    onChangeGameState(prev => {
      const mode = prev.gameMode || 'slowpitch';
      const updated = { ...prev };
      
      updated.awayTeam = {
        name: 'Pendang Softball Club',
        roster: JSON.parse(JSON.stringify(PRESET_AWAY_PLAYERS)),
        battingOrder: [],
      };
      updated.homeTeam = {
        name: 'Red Stallions FC',
        roster: JSON.parse(JSON.stringify(PRESET_HOME_PLAYERS)),
        battingOrder: [],
      };

      if (mode === 'fastpitch') {
        const fastpitchPositions = ['SS', '2B', 'CF', '3B', '1B', 'LF', 'RF', 'C', 'DP', 'P'];
        updated.awayTeam.roster.forEach((p, idx) => {
          if (idx < 10) p.position = fastpitchPositions[idx];
          else p.position = 'DH';
        });
        updated.homeTeam.roster.forEach((p, idx) => {
          if (idx < 10) p.position = fastpitchPositions[idx];
          else p.position = 'DH';
        });
        updated.awayTeam.battingOrder = updated.awayTeam.roster.slice(0, 9).map(p => p.id);
        updated.homeTeam.battingOrder = updated.homeTeam.roster.slice(0, 9).map(p => p.id);
        updated.currentPitcherId = {
          away: updated.awayTeam.roster[9].id, // a10 which is P (FLEX)
          home: updated.homeTeam.roster[9].id, // h10 which is P (FLEX)
        };
      } else {
        const slowpitchPositions = ['SS', '2B', 'CF', '3B', '1B', 'LF', 'RF', 'C', 'P', 'SF', 'EP'];
        updated.awayTeam.roster.forEach((p, idx) => {
          if (idx < 11) p.position = slowpitchPositions[idx];
          else p.position = 'DH';
        });
        updated.homeTeam.roster.forEach((p, idx) => {
          if (idx < 11) p.position = slowpitchPositions[idx];
          else p.position = 'DH';
        });
        updated.awayTeam.battingOrder = updated.awayTeam.roster.slice(0, 11).map(p => p.id);
        updated.homeTeam.battingOrder = updated.homeTeam.roster.slice(0, 11).map(p => p.id);
        updated.currentPitcherId = {
          away: updated.awayTeam.roster[8].id, // a9 which is P
          home: updated.homeTeam.roster[8].id, // h9 which is P
        };
      }
      return updated;
    });
  };

  const handleBattingNoChange = (playerIdx: number, newOrderVal: string) => {
    onChangeGameState(prev => {
      const updated = { ...prev };
      const team = activeTab === 'away' ? updated.awayTeam : updated.homeTeam;
      const player = team.roster[playerIdx];
      if (!player) return prev;

      const maxBatters = updated.gameMode === 'fastpitch' ? 9 : 11;
      const playerId = player.id;

      // Filter other occurrences of player ID out first
      let cleanOrder = team.battingOrder.filter(id => id !== playerId);

      if (newOrderVal !== 'none') {
        const orderIndex = parseInt(newOrderVal, 10) - 1;
        
        // Find if someone is already at orderIndex
        const occupantId = cleanOrder[orderIndex];
        
        if (occupantId) {
          // Swap: put occupant in player's previous index if player had one
          const prevIdx = team.battingOrder.indexOf(playerId);
          if (prevIdx !== -1 && prevIdx < maxBatters) {
            cleanOrder[prevIdx] = occupantId;
          } else {
            // Occupant gets bumped to none
            cleanOrder = cleanOrder.filter(id => id !== occupantId);
          }
        }
        
        // Ensure array is sufficiently large
        while (cleanOrder.length < maxBatters) {
          cleanOrder.push('');
        }
        
        cleanOrder[orderIndex] = playerId;
      }

      // Compact empty spots to maintain integrity
      team.battingOrder = cleanOrder.filter(id => id);
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
            {isEn ? 'Squad Roster & Batting Lineup' : 'Senarai Roster & Turutan Memukul'}
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

        {/* Rules hint banner */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800 text-[11px] hover:bg-slate-950/60 transition-colors text-slate-400 font-sans flex flex-col gap-1">
          {gameState.gameMode === 'slowpitch' ? (
            <p className="leading-relaxed">
              💡 <strong>Slowpitch Mode:</strong> {isEn ? "10 players actively field on defense. Up to 11 batters are allowed in the lineup: 10 fielders and 1 Extra Player (EP) who only bats and doesn't play defense. All other registered players are reserves (Bench)." : "10 pemain aktif bertahan (padang). Dibenarkan sehingga 11 pemukul: 10 pemain padang dan 1 Extra Player (EP) yang memukul sahaja tanpa turun padang. Baki bauran pemain pendaftaran yang lain dikira sebagai simpanan (Bench)."}
            </p>
          ) : (
            <p className="leading-relaxed">
              💡 <strong>Fastpitch Mode:</strong> {isEn ? "9 players actively field on defense. 9 batters are in the batting lineup (usually includes DP, while the P/FLEX fields only and does not bat). All other registered players are reserves (Bench)." : "9 pemain aktif bertahan di padang. Terdapat 9 pemukul dalam turutan utama (biasanya termasuk DP, manakala P/FLEX bertahan sahaja dan tidak memukul). Baki bauran pemain pendaftaran yang lain dikira sebagai simpanan (Bench)."}
            </p>
          )}
        </div>

        {/* Desktop Header Row */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider font-bold font-mono text-slate-400">
          <div className="w-6 text-center">#</div>
          <div className="flex-1 min-w-[200px]">{isEn ? 'Player Name' : 'Nama Pemain'}</div>
          <div className="w-20 text-center">{isEn ? 'Jersey No.' : 'No. Jersi'}</div>
          <div className="w-40">{isEn ? 'Batting Spot / Role' : 'No. Pemukul / Peranan'}</div>
          <div className="w-48">{isEn ? 'Defensive Position' : 'Posisi Padang'}</div>
          <div className="w-10 text-center">✕</div>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-120 overflow-y-auto">
          {currentTeam.roster.map((player, idx) => {
            const battingNoIdx = currentTeam.battingOrder.indexOf(player.id);
            const battingNo = battingNoIdx !== -1 ? String(battingNoIdx + 1) : 'none';
            const isStartingBatter = battingNo !== 'none';
            const isDefensiveStarter = player.position !== 'DH' && player.position !== 'DP' && player.position !== 'EP' && player.position !== 'Bench';

            return (
              <div 
                key={player.id} 
                className={`p-3 flex flex-wrap md:flex-nowrap items-center gap-3 transition-colors ${
                  isStartingBatter 
                    ? 'bg-indigo-950/5 hover:bg-indigo-950/10' 
                    : isDefensiveStarter 
                      ? 'bg-emerald-950/5 hover:bg-emerald-950/10'
                      : 'hover:bg-slate-900/30'
                }`}
              >
                {/* Roster index badge */}
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  {idx + 1}
                </div>

                {/* Player Name */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handlePlayerChange(activeTab, idx, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-slate-600 text-slate-250 placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none transition"
                    placeholder={t.name}
                  />
                </div>

                {/* Player Uniform Number */}
                <div className="w-20 shrink-0">
                  <input
                    type="text"
                    value={player.number}
                    onChange={(e) => handlePlayerChange(activeTab, idx, 'number', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-slate-600 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono text-center focus:outline-none transition"
                    placeholder={t.number}
                    maxLength={3}
                  />
                </div>

                {/* Batting Spot selection */}
                <div className="w-40 shrink-0">
                  <select
                    value={battingNo}
                    onChange={(e) => handleBattingNoChange(idx, e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg px-2 py-1.5 text-xs font-sans focus:outline-none transition ${
                      isStartingBatter
                        ? 'border-indigo-500/80 font-bold text-indigo-400 bg-indigo-950/25'
                        : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    <option value="none">
                      {isEn ? '— Defensive / Bench' : '— Defend / Simpanan'}
                    </option>
                    {Array.from({ length: gameState.gameMode === 'fastpitch' ? 9 : 11 }).map((_, bIdx) => (
                      <option key={bIdx + 1} value={String(bIdx + 1)}>
                        {bIdx === 10
                          ? (isEn ? '#11 EP (Extra Player)' : 'Pemukul ke-11 (EP)')
                          : (isEn ? `#${bIdx + 1} Batter` : `Pemukul ke-${bIdx + 1}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Player Position selection */}
                <div className="w-48 shrink-0">
                  <select
                    value={player.position}
                    onChange={(e) => handlePlayerChange(activeTab, idx, 'position', e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg px-2 py-1.5 text-xs focus:outline-none transition ${
                      isDefensiveStarter && player.position !== 'DP'
                        ? 'border-emerald-500/80 font-medium text-emerald-400 bg-emerald-950/25'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {SOFTBALL_POSITIONS.map(pos => (
                      <option key={pos.value} value={pos.value}>
                        {pos.value} - {isEn ? pos.labelEn : pos.labelMs}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove button */}
                <div className="w-10 shrink-0 flex justify-center">
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
            );
          })}
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
