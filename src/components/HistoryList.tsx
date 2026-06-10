/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameState, Language } from '../types';
import { TRANSLATIONS } from '../utils';
import { Calendar, Trash2, Trophy, RotateCcw, ChevronRight } from 'lucide-react';

interface HistoryListProps {
  games: GameState[];
  onLoadGame: (game: GameState) => void;
  onDeleteGame: (gameId: string) => void;
  language: Language;
}

export default function HistoryList({ games, onLoadGame, onDeleteGame, language }: HistoryListProps) {
  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  if (games.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl">
          ⚾
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-300">{isEn ? 'No Game Archives Yet' : 'Tiada Sejarah Perlawanan'}</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {t.noPastGames}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-sm font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">
        {isEn ? `SAVED MATCHES (${games.length})` : `PERLAWANAN DISIMPAN (${games.length})`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(game => {
          const isFinished = game.status === 'finished';
          
          // Determine winner
          const awayWinner = game.awayRunsTotal > game.homeRunsTotal;
          const homeWinner = game.homeRunsTotal > game.awayRunsTotal;
          const isDraw = game.awayRunsTotal === game.homeRunsTotal;

          return (
            <div
              key={game.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:shadow-indigo-505/5 transition duration-150 group"
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3">
                <span className="text-[10px] font-mono font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {game.date}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
                    isFinished
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isFinished ? t.statusFinished : t.statusLive}
                </span>
              </div>

              {/* Match Scoreboard */}
              <div className="flex items-center justify-between gap-4 py-2">
                {/* Away Team Lineup Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                    <span className={`text-sm font-bold truncate ${awayWinner && isFinished ? 'text-white' : 'text-slate-400'}`}>
                      {game.awayTeam.name}
                    </span>
                    {awayWinner && isFinished && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Hits: {game.awayHitsTotal} | Errors: {game.awayErrorsTotal}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-xl font-display font-black text-lg border border-slate-800 font-mono">
                  <span className={awayWinner && isFinished ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>{game.awayRunsTotal}</span>
                  <span className="text-slate-600">:</span>
                  <span className={homeWinner && isFinished ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}>{game.homeRunsTotal}</span>
                </div>

                {/* Home Team Lineup Details */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {homeWinner && isFinished && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    <span className={`text-sm font-bold truncate ${homeWinner && isFinished ? 'text-white' : 'text-slate-400'}`}>
                      {game.homeTeam.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Hits: {game.homeHitsTotal} | Errors: {game.homeErrorsTotal}
                  </div>
                </div>
              </div>

              {/* Botton Operations bar */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-3 mt-4">
                {/* Delete Button */}
                <button
                  type="button"
                  id={`btn-del-${game.id}`}
                  onClick={() => {
                    if (window.confirm(t.confirmDelete)) {
                      onDeleteGame(game.id);
                    }
                  }}
                  className="p-1.5 bg-slate-950 hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-lg transition duration-150 border border-slate-800 hover:border-red-900"
                  title={t.deleteGame}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Review/Resume Button */}
                <button
                  type="button"
                  id={`btn-load-${game.id}`}
                  onClick={() => onLoadGame(game)}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold font-sans transition duration-150 border border-indigo-500/20"
                >
                  <span>{isFinished ? (isEn ? 'Review Match' : 'Lihat Rekod') : (isEn ? 'Resume Game' : 'Sambung Buku')}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
