/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState, Language, Player } from '../types';
import { BookOpen, Search, Zap, Check, ChevronDown, ChevronUp, Shield, Activity, HelpCircle, User, Star, Lightbulb, Play, Info } from 'lucide-react';

interface WbscCheatSheetProps {
  gameState: GameState;
  onLogCustomWbscPlay: (params: {
    symbol: string;
    description: string;
    playerName: string;
    addOuts: number;
    addHits: boolean;
    addRuns: boolean;
    addError: boolean;
    resetCount: boolean;
    clearBases: boolean;
  }) => void;
  language: Language;
}

interface SymbolItem {
  code: string;
  nameEn: string;
  nameMs: string;
  category: 'batting' | 'out' | 'running' | 'special' | 'positions';
  subTextEn?: string;
  subTextMs?: string;
}

const WBSC_SYMBOLS_DATA: SymbolItem[] = [
  // Positions
  { code: '1', nameEn: 'Pitcher (P)', nameMs: 'Pelempar (P)', category: 'positions', subTextEn: 'Pitcher position number', subTextMs: 'Balingan utama meleret/laju' },
  { code: '2', nameEn: 'Catcher (C)', nameMs: 'Penangkap (C)', category: 'positions', subTextEn: 'Home plate protection and receiver', subTextMs: 'Penangkap di belakang pemukul' },
  { code: '3', nameEn: 'First Baseman (1B)', nameMs: 'Pemain Tapak Pertama (1B)', category: 'positions', subTextEn: 'First base guardian', subTextMs: 'Penjaga tapak pertama' },
  { code: '4', nameEn: 'Second Baseman (2B)', nameMs: 'Pemain Tapak Kedua (2B)', category: 'positions', subTextEn: 'Second base guardian', subTextMs: 'Penjaga tapak kedua' },
  { code: '5', nameEn: 'Third Baseman (3B)', nameMs: 'Pemain Tapak Ketiga (3B)', category: 'positions', subTextEn: 'Third base guardian', subTextMs: 'Penjaga tapak ketiga' },
  { code: '6', nameEn: 'Shortstop (SS)', nameMs: 'Pemain Penghalang Pendek (SS)', category: 'positions', subTextEn: 'Shortstop position play maker', subTextMs: 'Penghalang tengah antara 2B & 3B' },
  { code: '7', nameEn: 'Left Fielder (LF)', nameMs: 'Pemain Padang Kiri (LF)', category: 'positions', subTextEn: 'Outfield Left wing guardian', subTextMs: 'Penjaga padang luar kiri' },
  { code: '8', nameEn: 'Center Fielder (CF)', nameMs: 'Pemain Padang Tengah (CF)', category: 'positions', subTextEn: 'Outfield Middle sector coordinator', subTextMs: 'Penjaga padang luar tengah' },
  { code: '9', nameEn: 'Right Fielder (RF)', nameMs: 'Pemain Padang Kanan (RF)', category: 'positions', subTextEn: 'Outfield Right wing guardian', subTextMs: 'Penjaga padang luar kanan' },

  // Batting Symbols
  { code: '1B', nameEn: 'Single', nameMs: 'Pukulan Satu Tapak (Single)', category: 'batting', subTextEn: 'Batter reaches 1st base', subTextMs: 'Pemukul sampai ke tapak pertama jaya' },
  { code: '2B', nameEn: 'Double', nameMs: 'Pukulan Dua Tapak (Double)', category: 'batting', subTextEn: 'Batter reaches 2nd base', subTextMs: 'Pemukul sampai ke tapak kedua jaya' },
  { code: '3B', nameEn: 'Triple', nameMs: 'Pukulan Tiga Tapak (Triple)', category: 'batting', subTextEn: 'Batter reaches 3rd base', subTextMs: 'Pemukul sampai ke tapak ketiga jaya' },
  { code: 'HR', nameEn: 'Home Run', nameMs: 'Larian Penuh (Home Run)', category: 'batting', subTextEn: 'Batter scores directly', subTextMs: 'Larian terus ke tapak penamat' },
  { code: 'BB', nameEn: 'Walk (Base on Balls)', nameMs: 'Larian Percuma (Walk/BB)', category: 'batting', subTextEn: '4 balls reached, advances automatically', subTextMs: '4 bola dicapai, maju automatik' },
  { code: 'IBB', nameEn: 'Intentional Walk', nameMs: 'Walk Sengaja (IBB)', category: 'batting', subTextEn: 'Batter awarded 1st base on purpose', subTextMs: 'Pemberian tapak pertama secara sengaja' },
  { code: 'HBP', nameEn: 'Hit By Pitch', nameMs: 'Kena Balingan (HBP)', category: 'batting', subTextEn: 'Batter hit by pitcher ball', subTextMs: 'Pemukul terkena bola balingan pelempar' },
  { code: 'K', nameEn: 'Strikeout Swinging', nameMs: 'Strik-keluar Hayun (K)', category: 'batting', subTextEn: '3 strikes from swinging attempts', subTextMs: '3 strik melalui cubaan hayunan pemukul' },
  { code: '■', nameEn: 'Strikeout Looking', nameMs: 'Strik-keluar Melihat (■)', category: 'batting', subTextEn: '3 strikes completed without swing', subTextMs: '3 strik tamat tanpa hayunan pemukul' },
  { code: 'SAC', nameEn: 'Sacrifice Bunt (SAC/SH)', nameMs: 'Bunt Korban (SAC/SH)', category: 'batting', subTextEn: 'Bunt to advance runner but batter gets putout', subTextMs: 'Bunt untuk majukan pelari tapi pemukul keluar' },
  { code: 'SF', nameEn: 'Sacrifice Fly', nameMs: 'Fly Korban (SF)', category: 'batting', subTextEn: 'Flyball caught but advances runner to score', subTextMs: 'Bola layang ditangkap tapi pelari berjaya lari' },
  { code: 'FC', nameEn: "Fielder's Choice", nameMs: 'Pilihan Pemadang (FC)', category: 'batting', subTextEn: 'Defense chooses to retire runner instead of batter', subTextMs: 'Defensif pilih matikan pelari daripada pemukul' },
  { code: 'E', nameEn: 'Error', nameMs: 'Ralat Padang (Error/E)', category: 'batting', subTextEn: 'Batter reaches base due to defensive error', subTextMs: 'Pemukul sampai tapak berpunca ralat defensif' },
  { code: 'CI', nameEn: "Catcher's Interference", nameMs: 'Guan Catcher (CI)', category: 'batting', subTextEn: 'Catcher obstructs bat swing', subTextMs: 'Penangkap mengganggu hayunan pemukul' },

  // Out Symbols
  { code: 'F7', nameEn: 'Fly Out to LF', nameMs: 'Mati Sasar ke Padang Kiri (F7)', category: 'out', subTextEn: 'Flyball caught by Left Fielder', subTextMs: 'Bola sasar ditangkap Pemadang Kiri' },
  { code: 'F8', nameEn: 'Fly Out to CF', nameMs: 'Mati Sasar ke Padang Tengah (F8)', category: 'out', subTextEn: 'Flyball caught by Center Fielder', subTextMs: 'Bola sasar ditangkap Pemadang Tengah' },
  { code: 'F9', nameEn: 'Fly Out to RF', nameMs: 'Mati Sasar ke Padang Kanan (F9)', category: 'out', subTextEn: 'Flyball caught by Right Fielder', subTextMs: 'Bola sasar ditangkap Pemadang Kanan' },
  { code: 'L6', nameEn: 'Line Out to SS', nameMs: 'Sasar Garis ke Penghalang SS (L6)', category: 'out', subTextEn: 'Line drive caught directly by Shortstop', subTextMs: 'Pukulan laju ditangkap terus oleh Shortstop' },
  { code: '6-3', nameEn: 'Ground Out SS to 1B', nameMs: 'Mati Padang SS ke 1B (6-3)', category: 'out', subTextEn: 'SS assists baseout at 1st Baseman', subTextMs: 'Bola tanah dilempar SS ke Tapak Pertama' },
  { code: '5-3', nameEn: 'Ground Out 3B to 1B', nameMs: 'Mati Padang 3B ke 1B (5-3)', category: 'out', subTextEn: '3B assists baseout at 1st Baseman', subTextMs: 'Bola tanah dilempar 3B ke Tapak Pertama' },
  { code: '4-3', nameEn: 'Ground Out 2B to 1B', nameMs: 'Mati Padang 2B ke 1B (4-3)', category: 'out', subTextEn: '2B assists baseout at 1st Baseman', subTextMs: 'Bola tanah dilempar 2B ke Tapak Pertama' },
  { code: 'U3', nameEn: 'Unassisted Out by 1B', nameMs: 'Mati Sendiri oleh 1B (U3)', category: 'out', subTextEn: 'First Baseman steps on base alone', subTextMs: 'Pemain Tapak Pertama matikan bola sendiri' },
  { code: 'DP', nameEn: 'Double Play', nameMs: 'Dua Mati Serentak (Double Play/DP)', category: 'out', subTextEn: 'Two outs achieved on the same play', subTextMs: 'Dua out dikesan dalam satu gerakan play' },
  { code: 'TP', nameEn: 'Triple Play', nameMs: 'Tiga Mati Serentak (Triple Play/TP)', category: 'out', subTextEn: 'Three outs achieved on the same play', subTextMs: 'Tiga out dikesan dalam satu gerakan play' },

  // Running Symbols
  { code: 'SB', nameEn: 'Stolen Base', nameMs: 'Curi Tapak (SB)', category: 'running', subTextEn: 'Runner steals next base successfully', subTextMs: 'Pelari mencuri tapak seterusnya dengan jaya' },
  { code: 'CS', nameEn: 'Caught Stealing', nameMs: 'Mati Curi Tapak (CS)', category: 'running', subTextEn: 'Runner caught attempting steal', subTextMs: 'Pelari dimatikan semasa mencuri tapak' },
  { code: 'PO', nameEn: 'Pick Off', nameMs: 'Mati Pick-Off (PO)', category: 'running', subTextEn: 'Runner tagged off base by pitcher catch throw', subTextMs: 'Pelari terpancing keluar tapak oleh balingan' },
  { code: 'WP', nameEn: 'Wild Pitch', nameMs: 'Balingan Terbabas (WP)', category: 'running', subTextEn: 'Pitcher throws wildly past catcher', subTextMs: 'Pelempar membaling terlampau tinggi/liar' },
  { code: 'PB', nameEn: 'Passed Ball', nameMs: 'Bola Terlepas (PB)', category: 'running', subTextEn: 'Catcher drops a catchable ball', subTextMs: 'Penangkap terlepas tangkapan bola mudah' },
  { code: 'R', nameEn: 'Run Scored', nameMs: 'Larian Dijaringkan (R)', category: 'running', subTextEn: 'Runner crosses home plate safely', subTextMs: 'Pelari melintasi tapak penamat dengan selamat' },

  // Special Symbols
  { code: 'IF', nameEn: 'Infield Fly', nameMs: 'Infield Fly (IF)', category: 'special', subTextEn: 'Automatic out declared on shallow popup with runners', subTextMs: 'Mati automatik untuk bola layang mudah zon dalam' },
  { code: 'OBS', nameEn: 'Obstruction', nameMs: 'Halangan Pemadang (OBS)', category: 'special', subTextEn: 'Fielder obstructs runner without ball', subTextMs: 'Pemain bertahan menghalang runner tanpa memegang bola' },
  { code: 'INT', nameEn: 'Interference', nameMs: 'Gangguan Pelari/Batter (INT)', category: 'special', subTextEn: 'Offensive team player disrupts defensive play', subTextMs: 'Pemain menyerang mengganggu pemain bertahan' },
  { code: 'RLI', nameEn: "Runner's Lane Interference", nameMs: 'Salah Laluan Pelari (RLI)', category: 'special', subTextEn: 'Runner runs outside regular baseline', subTextMs: 'Pemain mengganggu balingan 1B kerana salah laluan' },
  { code: 'AP', nameEn: 'Appeal Play', nameMs: 'Mainan Rayuan (Appeal Play/AP)', category: 'special', subTextEn: 'Defensive team appeals runner missed base', subTextMs: 'Rayuan rasmi kepada umpire mendapat out' },
  { code: 'FLEX', nameEn: 'FLEX Lineup status', nameMs: 'Pemain Pertahanan Bertumpu (FLEX)', category: 'special', subTextEn: 'Player in lineup field only (doesn’t bat)', subTextMs: 'Pemain pertahanan sahaja dalam barisan pasukan' },
  { code: 'OPO', nameEn: 'Offensive Player Only', nameMs: 'Pemain Memukul Khas (OPO)', category: 'special', subTextEn: 'Batter-only designation in lineup', subTextMs: 'Pemain memukul sahaja, tiada tugas pertahanan' },
];

export default function WbscCheatSheet({ gameState, onLogCustomWbscPlay, language }: WbscCheatSheetProps) {
  const isEn = language === 'en';
  const [isOpen, setIsOpen] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'cheat' | 'instant' | 'situations'>('cheat');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Instant play state
  const [selectedSymbolCode, setSelectedSymbolCode] = useState<string>('1B');
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('');
  const [actionAddOuts, setActionAddOuts] = useState<number>(0);
  const [actionAddHits, setActionAddHits] = useState<boolean>(false);
  const [actionAddRuns, setActionAddRuns] = useState<boolean>(false);
  const [actionAddError, setActionAddError] = useState<boolean>(false);
  const [actionResetCount, setActionResetCount] = useState<boolean>(true);
  const [actionClearBases, setActionClearBases] = useState<boolean>(false);

  // Filtered WBSC symbols
  const filteredSymbols = WBSC_SYMBOLS_DATA.filter(sym => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      sym.code.toLowerCase().includes(term) ||
      sym.nameEn.toLowerCase().includes(term) ||
      sym.nameMs.toLowerCase().includes(term) ||
      (sym.subTextEn && sym.subTextEn.toLowerCase().includes(term)) ||
      (sym.subTextMs && sym.subTextMs.toLowerCase().includes(term));
    
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && sym.category === categoryFilter;
  });

  // Active symbol object
  const currentSymbolObj = WBSC_SYMBOLS_DATA.find(s => s.code === selectedSymbolCode) || WBSC_SYMBOLS_DATA[0];

  // Auto-fill effects based on selected symbol to make logging extremely easy
  const handleSymbolSelect = (code: string) => {
    setSelectedSymbolCode(code);
    const symObj = WBSC_SYMBOLS_DATA.find(s => s.code === code);
    if (symObj) {
      if (symObj.category === 'batting') {
        const isHit = ['1B', '2B', '3B', 'HR'].includes(code);
        setActionAddHits(isHit);
        setActionAddRuns(code === 'HR');
        setActionAddOuts(0);
        setActionAddError(code === 'E');
        setActionResetCount(true);
      } else if (symObj.category === 'out') {
        setActionAddOuts(1);
        setActionAddHits(false);
        setActionAddRuns(false);
        setActionAddError(false);
        setActionResetCount(true);
      } else if (symObj.category === 'running') {
        setActionAddOuts(code === 'CS' || code === 'PO' ? 1 : 0);
        setActionAddHits(false);
        setActionAddRuns(code === 'R');
        setActionAddError(false);
        setActionResetCount(false);
      } else {
        setActionAddOuts(0);
        setActionAddHits(false);
        setActionAddRuns(false);
        setActionAddError(false);
        setActionResetCount(false);
      }
    }
  };

  // Submit custom logs
  const handleExecutePlayOnState = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose selected player name or default to active batter
    let pName = selectedPlayerName;
    if (!pName) {
      const activeBattingTeam = gameState.isTopInning ? gameState.awayTeam : gameState.homeTeam;
      const currentBatterIdx = gameState.isTopInning ? gameState.currentBatterIndex.away : gameState.currentBatterIndex.home;
      const batterId = activeBattingTeam.battingOrder[currentBatterIdx % (activeBattingTeam.battingOrder.length || 1)];
      const batter = activeBattingTeam.roster.find(p => p.id === batterId);
      pName = batter && batter.name ? batter.name : `${isEn ? 'Batter' : 'Pemukul'} #${(currentBatterIdx % (activeBattingTeam.battingOrder.length || 1)) + 1}`;
    }

    onLogCustomWbscPlay({
      symbol: selectedSymbolCode,
      description: isEn ? currentSymbolObj.nameEn : currentSymbolObj.nameMs,
      playerName: pName,
      addOuts: actionAddOuts,
      addHits: actionAddHits,
      addRuns: actionAddRuns,
      addError: actionAddError,
      resetCount: actionResetCount,
      clearBases: actionClearBases,
    });

    // Reset select forms
    setSelectedPlayerName('');
  };

  // Trigger quick preset situation from page 2 of PDF
  const triggerSituationPlay = (sit: {
    symbol: string,
    descEn: string,
    descMs: string,
    outs: number,
    hits: boolean,
    runs: boolean,
    errors: boolean,
    resetCount: boolean,
    clearBases: boolean,
    subjectPlayer?: string
  }) => {
    const activeBattingTeam = gameState.isTopInning ? gameState.awayTeam : gameState.homeTeam;
    const currentBatterIdx = gameState.isTopInning ? gameState.currentBatterIndex.away : gameState.currentBatterIndex.home;
    const batterId = activeBattingTeam.battingOrder[currentBatterIdx % (activeBattingTeam.battingOrder.length || 1)];
    const batter = activeBattingTeam.roster.find(p => p.id === batterId);
    const pName = sit.subjectPlayer || (batter && batter.name ? batter.name : `${isEn ? 'Batter' : 'Pemukul'} #${(currentBatterIdx % (activeBattingTeam.battingOrder.length || 1)) + 1}`);

    onLogCustomWbscPlay({
      symbol: sit.symbol,
      description: isEn ? sit.descEn : sit.descMs,
      playerName: pName,
      addOuts: sit.outs,
      addHits: sit.hits,
      addRuns: sit.runs,
      addError: sit.errors,
      resetCount: sit.resetCount,
      clearBases: sit.clearBases
    });
  };

  // Get current players list for selection dropdown
  const getAllCurrentPlayers = (): Player[] => {
    return [
      ...gameState.awayTeam.roster,
      ...gameState.homeTeam.roster
    ];
  };

  // Preset situations from PDF to make training/logging instant
  const PDF_SITUATIONS = [
    {
      id: 'sit1',
      titleEn: 'Situation 1: Batter hits Single (1B)',
      titleMs: 'Situasi 1: Batter pukul Single (1B)',
      noteEn: 'Draw pathway from Home to First Base.',
      noteMs: 'Lukis laluan dari Home ke First Base.',
      symbol: '1B',
      outs: 0, hits: true, runs: false, errors: false, resetCount: true, clearBases: false,
      descEn: 'Single, reached 1st Base',
      descMs: 'Single, jaya sampai ke tapak pertama'
    },
    {
      id: 'sit2',
      titleEn: 'Situation 2: Grounder to SS, throws to 1B (6-3)',
      titleMs: 'Situasi 2: Grounder ke SS, baling ke 1B (6-3)',
      noteEn: 'Batter Out at First Base.',
      noteMs: 'Keputusan: Batter OUT di First Base.',
      symbol: '6-3',
      outs: 1, hits: false, runs: false, errors: false, resetCount: true, clearBases: false,
      descEn: 'Retired on Ground Out Shortstop assist to First Baseman',
      descMs: 'Mati Padang, SS baling pantas ke Tapak Pertama'
    },
    {
      id: 'sit3',
      titleEn: 'Situation 3: Batter Strikeout Swinging (K)',
      titleMs: 'Situasi 3: Batter Strikeout Swinging (K)',
      noteEn: '3 strikes gathered through active swing attempt.',
      noteMs: 'Mati strikeout penuh dengan hayunan.',
      symbol: 'K',
      outs: 1, hits: false, runs: false, errors: false, resetCount: true, clearBases: false,
      descEn: 'Strikeout swinging',
      descMs: 'Strikeout hayun keluar'
    },
    {
      id: 'sit4',
      titleEn: 'Situation 4: Batter Strikeout Looking (■)',
      titleMs: 'Situasi 4: Batter Strikeout Looking (■)',
      noteEn: '3 strikes gathered without attempting swing.',
      noteMs: 'Mati strikeout melihat tanpa hayun.',
      symbol: '■',
      outs: 1, hits: false, runs: false, errors: false, resetCount: true, clearBases: false,
      descEn: 'Strikeout looking',
      descMs: 'Strikeout melihat tanpa memotong'
    },
    {
      id: 'sit5',
      titleEn: 'Situation 5: Runner steals Second Base (SB2)',
      titleMs: 'Situasi 5: Runner curi Base Kedua (SB2)',
      noteEn: 'Steals space successfully.',
      noteMs: 'Berjaya mencuri tapak kedua (SB2).',
      symbol: 'SB',
      outs: 0, hits: false, runs: false, errors: false, resetCount: false, clearBases: false,
      descEn: 'Stolen Base (SB2)',
      descMs: 'Curi Tapak Kedua berhasil'
    },
    {
      id: 'sit6',
      titleEn: 'Situation 6: Double Play (6-4-3 DP)',
      titleMs: 'Situasi 6: Runner di 1B, batter ground ball (6-4-3 DP)',
      noteEn: 'SS → 2B → 1B. Resulting in Double Play (2 Outs)!',
      noteMs: 'SS → 2B → 1B. Keputusan: Dua Mati Serentak (Double Play).',
      symbol: '6-4-3 DP',
      outs: 2, hits: false, runs: false, errors: false, resetCount: true, clearBases: false,
      descEn: 'Double Play, SS to 2B to 1B',
      descMs: 'Double Play, Matikan 2B lalu baling ke 1B'
    },
    {
      id: 'sit7',
      titleEn: 'Triple Play (5-2-4-3 TP)',
      titleMs: 'Tiga Mati Serentak (5-2-4-3 TP)',
      noteEn: 'Bases Loaded play. 3B → Home → 2B → 1B.',
      noteMs: 'Pemain tapak semua penuh. 3B → Home → 2B → 1B.',
      symbol: '5-2-4-3 TP',
      outs: 3, hits: false, runs: false, errors: false, resetCount: true, clearBases: true,
      descEn: 'Triple Play (3 Outs achieved)',
      descMs: 'Triple Play (3 Mati Serentak padamu)'
    }
  ];

  return (
    <div id="wbsc-handbook-panel" className="bg-slate-900 border border-indigo-950/80 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden">
      
      {/* Dynamic Ambient Line glow */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-500" />
      
      {/* Panel Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none pb-3 border-b border-b-slate-800/80"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <h3 className="font-display font-extrabold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              📘 WBSC - PUSINGBASE COOPERATIVE HANDBOOK
            </h3>
            <span className="text-[10px] text-indigo-300 font-mono mt-1 block">
              {isEn ? "WBSC standard rules & Malaysian Interactive Play Logger" : "Panduan & Sistem Pemarkahan Rasmi WBSC Malaysia"}
            </span>
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-white p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 flex flex-col gap-4 text-xs">
          
          {/* Sub-tabs Selection - 3 Sub Tabs now! */}
          <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800/50">
            <button
              type="button"
              onClick={() => setActiveSubTab('cheat')}
              className={`flex-1 py-2 font-display font-bold text-center rounded-lg transition duration-150 ${
                activeSubTab === 'cheat'
                  ? 'bg-indigo-650 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📚 {isEn ? "Handbook" : "Indeks Kod"}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('instant')}
              className={`flex-1 py-2 font-display font-bold text-center rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'instant'
                  ? 'bg-indigo-650 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-450 fill-amber-450" />
              {isEn ? "Express Logger" : "Log Ekspres"}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('situations')}
              className={`flex-1 py-2 font-display font-bold text-center rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'situations'
                  ? 'bg-indigo-650 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
              {isEn ? "Situations" : "Situasi PDF"}
            </button>
          </div>

          {/* SCREEN 1: CHEAT SHEET HANDBOOK WITH FILTER */}
          {activeSubTab === 'cheat' && (
            <div className="flex flex-col gap-3">
              {/* Search Bar & Category Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search codes or meanings..." : "Cari simbol atau takrifan..."}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950/50 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 outline-none focus:border-indigo-500 font-sans cursor-pointer"
                >
                  <option value="all">🔍 {isEn ? "All categories" : "Semua Kategori"}</option>
                  <option value="batting">🏏 {isEn ? "Batting Symbols" : "🏏 Giliran Memukul"}</option>
                  <option value="out">🛑 {isEn ? "Out Symbols" : "🛑 Mati Padang"}</option>
                  <option value="running">🏃 {isEn ? "Running Symbols" : "🏃 Larian Tapak"}</option>
                  <option value="special">⚙️ {isEn ? "WBSC Special Cases" : "⚙️ Kes Khas"}</option>
                  <option value="positions">🛡️ {isEn ? "Defense Positions (1-9)" : "🛡️ Posisi Pertahanan"}</option>
                </select>
              </div>

              {/* Grid/List of symbols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
                {filteredSymbols.map((item) => (
                  <div 
                    key={item.code} 
                    onClick={() => {
                      // Autoclick opens it in instant play logger for easy execution
                      handleSymbolSelect(item.code);
                      setActiveSubTab('instant');
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/45 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-505/40 cursor-pointer transition duration-150 flex gap-2.5 items-start group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-950/40 text-indigo-400 font-mono font-black text-center flex items-center justify-center border border-indigo-900/40 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-colors shrink-0">
                      {item.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-200 text-[11px] truncate leading-tight flex items-center justify-between">
                        <span>{isEn ? item.nameEn : item.nameMs}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug font-sans mt-0.5 truncate">
                        {isEn ? item.subTextEn : item.subTextMs}
                      </p>
                      <span className="inline-block mt-1 text-[8px] uppercase tracking-wider bg-slate-800/85 text-indigo-300 font-mono px-1.5 py-0.2 rounded font-bold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredSymbols.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 text-center py-6 text-slate-500 italic">
                    {isEn ? "No matching symbols found" : "Tiada perlawanan simbol dijumpai"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 2: INSTANT PLAY EVENT LOGGER & SKOR AUTOMATIK */}
          {activeSubTab === 'instant' && (
            <form onSubmit={handleExecutePlayOnState} className="flex flex-col gap-4">
              <div className="bg-indigo-950/10 border border-indigo-950 p-3.5 rounded-xl flex flex-col gap-2 relative">
                <span className="absolute top-2 right-2 text-[10px] font-mono text-indigo-400 tracking-wider font-extrabold flex items-center gap-1">
                  <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                  WBSC STANDARD
                </span>
                <span className="text-[10px] font-mono text-indigo-300 font-black tracking-widest uppercase">
                  {isEn ? "1. CHOOSE OFFICIAL SYMBOL" : "1. PILIH KOD SIMBOL RASMI WBSC"}
                </span>

                <select
                  value={selectedSymbolCode}
                  onChange={(e) => handleSymbolSelect(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 border border-slate-705 rounded-lg p-2 font-mono font-bold text-sm focus:border-indigo-400 focus:outline-none outline-none cursor-pointer"
                >
                  <optgroup label={isEn ? "🏏 Batting Action" : "🏏 Memukul"}>
                    {WBSC_SYMBOLS_DATA.filter(s => s.category === 'batting').map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {isEn ? s.nameEn : s.nameMs}</option>
                    ))}
                  </optgroup>
                  <optgroup label={isEn ? "🛑 Out Action" : "🛑 Mati Padang"}>
                    {WBSC_SYMBOLS_DATA.filter(s => s.category === 'out').map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {isEn ? s.nameEn : s.nameMs}</option>
                    ))}
                  </optgroup>
                  <optgroup label={isEn ? "🏃 Base Running" : "🏃 Larian Tapak"}>
                    {WBSC_SYMBOLS_DATA.filter(s => s.category === 'running').map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {isEn ? s.nameEn : s.nameMs}</option>
                    ))}
                  </optgroup>
                  <optgroup label={isEn ? "⚙️ Special Cases" : "⚙️ Hal-hal Khas"}>
                    {WBSC_SYMBOLS_DATA.filter(s => s.category === 'special').map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {isEn ? s.nameEn : s.nameMs}</option>
                    ))}
                  </optgroup>
                </select>

                <div className="text-[11px] font-medium text-slate-400 leading-snug mt-1 flex gap-1.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-white font-bold">{isEn ? 'Meaning: ' : 'Maksud: '}</span>
                    {isEn ? currentSymbolObj.nameEn : currentSymbolObj.nameMs}
                    {currentSymbolObj.subTextEn && (
                      <span className="block text-[10px] text-slate-500 italic mt-0.5">
                        ({isEn ? currentSymbolObj.subTextEn : currentSymbolObj.subTextMs})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Selector involved */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {isEn ? "2. PLAYER COMMITTING PLAY" : "2. NAMA PEMAIN YANG MELAKUKAN PLAY"}
                </label>
                <select
                  value={selectedPlayerName}
                  onChange={(e) => setSelectedPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 outline-none focus:border-indigo-400 cursor-pointer text-xs"
                >
                  <option value="">👤 {isEn ? "Default active batter/runner" : "Lalai (Pemukul aktif)"}</option>
                  {getAllCurrentPlayers().map((p) => (
                    <option key={p.id} value={p.name || p.id}>
                      {p.number ? `#${p.number}` : '-'} - {p.name || `${p.position} (${p.id.startsWith('a') ? (isEn ? 'Away' : 'Pelawat') : (isEn ? 'Home' : 'Tuan Rumah')})`}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500 font-mono italic">
                  * {isEn ? "Leaves on default to log under active batting rotators" : "Biarkan lalai untuk memaut pemain giliran memukul semasa"}
                </p>
              </div>

              {/* Automated state consequences selectors */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                <span className="block text-[10px] font-mono text-indigo-400 tracking-wider font-extrabold uppercase">
                  🛠️ {isEn ? "3. STATE UPDATES" : "3. PERUBAHAN SKOR LANGSUNG"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-[11px] font-medium text-slate-350">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>{isEn ? "Out count consequence" : "Kesan Keluar (Out)"}</span>
                    <select
                      value={actionAddOuts}
                      onChange={(e) => setActionAddOuts(Number(e.target.value))}
                      className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value={0}>0 {isEn ? "Outs" : "Mati"}</option>
                      <option value={1}>+1 {isEn ? "Out" : "Mati"}</option>
                      <option value={2}>+2 {isEn ? "Outs" : "Mati (DP)"}</option>
                      <option value={3}>+3 {isEn ? "Outs" : "Mati (TP, Ining swap)"}</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-100 select-none">
                    <input
                      type="checkbox"
                      checked={actionAddHits}
                      onChange={(e) => setActionAddHits(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>🍺 {isEn ? "Add Hit (+1 hit)" : "Tambah Pukulan (+1 Hit)"}</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-100 select-none">
                    <input
                      type="checkbox"
                      checked={actionAddRuns}
                      onChange={(e) => setActionAddRuns(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>🔴 {isEn ? "Add Run (+1 run)" : "Tambah Larian (+1 Run)"}</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-100 select-none">
                    <input
                      type="checkbox"
                      checked={actionAddError}
                      onChange={(e) => setActionAddError(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>⚠️ {isEn ? "Fielding Error (+1 E)" : "Ralat Defensif (+1 E)"}</span>
                  </label>

                  <label className="col-span-1 sm:col-span-2 flex items-center gap-2.5 cursor-pointer hover:text-slate-100 select-none pt-1">
                    <input
                      type="checkbox"
                      checked={actionResetCount}
                      onChange={(e) => setActionResetCount(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>🔄 {isEn ? "Reset strike count (0-0)" : "Tetap semula kiraan bater ke 0-0"}</span>
                  </label>

                  <label className="col-span-1 sm:col-span-2 flex items-center gap-2.5 cursor-pointer hover:text-slate-100 select-none">
                    <input
                      type="checkbox"
                      checked={actionClearBases}
                      onChange={(e) => setActionClearBases(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>❌ {isEn ? "Clear all base runners" : "Padam semua pelari dari tapak"}</span>
                  </label>
                </div>
              </div>

              {/* Submit Play button */}
              <button
                type="submit"
                id="btn-execute-wbsc-custom"
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-extrabold rounded-xl transition shadow-lg active:scale-95 cursor-pointer text-xs uppercase tracking-wider font-display"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                {isEn ? "Execute & Commit WBSC Play" : "Kemukakan & Log Play WBSC"}
              </button>
            </form>
          )}

          {/* SCREEN 3: PDF CASE PORTFOLIO & INTERACTIVE PRACTICE */}
          {activeSubTab === 'situations' && (
            <div className="flex flex-col gap-4 animate-fade-in pr-1">
              
              {/* Special WBSC Symbols with Definitions */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/85">
                <h4 className="text-[10px] font-mono text-indigo-400 font-extrabold tracking-wider uppercase mb-3 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {isEn ? "SPECIAL WBSC RULE DEFINITIONS" : "PENJELASAN SIMBOL SYARAT KHAS WBSC"}
                </h4>
                <div className="divide-y divide-slate-850 flex flex-col gap-2">
                  <div className="pt-1 select-none">
                    <div className="font-bold text-amber-450 font-mono text-xs flex items-center gap-1.5">[IF] Infield Fly</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Declared with less than 2 outs and force play on bases. Batter automatically out even if ball is dropped." : "Kurang 2 out dan terdapat force play. Batter automatik OUT walaupun bola tidak ditangkap."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-amber-450 font-mono text-xs flex items-center gap-1.5">[OBS] Obstruction</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Fielder blocks a runner pathway without having or attempting to catch the ball." : "Pemain bertahan menghalang runner tanpa memegang bola."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-amber-450 font-mono text-xs flex items-center gap-1.5">[INT] Interference</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Offensive player/runner physically disturbs a defender trying to complete a play." : "Pemain menyerang mengganggu pemain bertahan ketika permainan berlangsung."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-amber-450 font-mono text-xs flex items-center gap-1.5">[RLI] Runner's Lane Interference</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Batter-runner interferes with throw to 1B by running outside the legal pathway lines." : "Batter-runner mengganggu balingan ke 1B kerana tidak berada dalam laluan larian yang betul."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-amber-450 font-mono text-xs flex items-center gap-1.5">[AP] Appeal Play</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Official defense team protest to umpire regarding runner failing to touch a base." : "Rayuan rasmi oleh pasukan bertahan kepada umpire untuk mendapatkan out."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-teal-400 font-mono text-xs flex items-center gap-1.5">[FLEX] Defensive Only Pos</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Player in lineup who only holds defensive role and does not bat at all." : "Pemain bertahan sahaja dalam lineup (tidak memukul)."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-teal-400 font-mono text-xs flex items-center gap-1.5">[OPO] Offensive Player Only</div>
                    <p className="text-slate-300 mt-1 leading-relaxed font-sans text-[11px]">
                      {isEn ? "Player only bats and does not enter the field for defensive innings." : "Pemain hanya batting dan tidak bermain pertahanan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1 Inning Example Scenario Box */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-950/30">
                <h4 className="text-[10px] font-mono text-indigo-400 font-extrabold tracking-wider uppercase mb-2">
                  📖 {isEn ? "EXAMPLE OF ONE INNING LOGIC" : "CONTOH ALIRAN SATU INNING LENGKAP"}
                </h4>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                    <div>1. Batter A = <span className="text-indigo-400">1B (Single)</span></div>
                    <div>2. Batter B = <span className="text-indigo-400">BB (Walk)</span></div>
                    <div>3. Batter C = <span className="text-rose-400">F8 (Fly Out CF)</span></div>
                    <div>4. Batter D = <span className="text-rose-450">6-4-3 DP (Double Play)</span></div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-sans text-slate-400">
                    <span className="font-bold text-amber-450 text-xs block mb-1">🏁 {isEn ? 'Inning Result:' : 'Keputusan Inning:'}</span>
                    0 Run • 1 Hit • 0 Error • 2 Runner Left On Base (LOB)
                  </div>
                </div>
              </div>

              {/* Practice / Interactive Play logger situations */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  💡 {isEn ? "INTERACTIVE PRACTICE SIMULATIONS" : "SITUASI REALITI PDF KELAB SB"} 
                  <span className="text-[8px] italic ml-1 lowercase text-slate-500">({isEn ? "click play to auto-score" : "klik ikon main untuk uji skor"})</span>
                </span>

                <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {PDF_SITUATIONS.map((sit, idx) => (
                    <div 
                      key={sit.id}
                      className="p-3 bg-slate-950/30 border border-slate-800/80 hover:border-indigo-900 rounded-xl transition duration-150 relative flex justify-between items-center group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-300 block">
                          {isEn ? sit.titleEn : sit.titleMs}
                        </span>
                        <div className="text-[11px] font-bold text-slate-200 mt-0.5">
                          ➡ WBSC Code: <span className="font-mono bg-indigo-950/45 text-amber-400 px-1.5 py-0.2 rounded font-black text-xs">{sit.symbol}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1 font-sans italic">
                          💡 {isEn ? sit.noteEn : sit.noteMs}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerSituationPlay(sit)}
                        className="py-2 px-3 bg-indigo-650 hover:bg-indigo-500 hover:text-white rounded-lg transition-all duration-150 text-white font-extrabold flex items-center gap-1 shadow shrink-0 active:scale-95 cursor-pointer"
                        title={isEn ? "Execute this play into current live scorebook" : "Masukkan situasi ini ke rekod live"}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span className="text-[10px] tracking-wide uppercase font-display">{isEn ? "Test" : "Ting"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
