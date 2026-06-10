/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, Language, GameEvent, Player, InningScore } from './types';
import { createBlankGame, TRANSLATIONS, SOFTBALL_POSITIONS } from './utils';
import ScoreboardHeader from './components/ScoreboardHeader';
import LiveControls from './components/LiveControls';
import BaseMap from './components/BaseMap';
import StatsTable from './components/StatsTable';
import RosterSetup from './components/RosterSetup';
import HistoryList from './components/HistoryList';
import WbscCheatSheet from './components/WbscCheatSheet';
import { Trophy, HelpCircle, FileText, Settings, Heart, Plus, BookOpen, VolumeX, ArrowLeft, HeartOff, Landmark, Share } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(createBlankGame());
  const [historyStack, setHistoryStack] = useState<string[]>([]); // Serialized JSON state stack for 100% accurate Undo
  const [gamesList, setGamesList] = useState<GameState[]>([]);
  const [language, setLanguage] = useState<Language>('ms'); // Default to 'ms' since user requested in Malay

  // Live Substitution local dropdown states
  const [subTeam, setSubTeam] = useState<'away' | 'home'>('away');
  const [activeSubId, setActiveSubId] = useState<string>('');
  const [benchSubId, setBenchSubId] = useState<string>('');

  // Load previous games from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('softball_scorebook_games');
    if (saved) {
      try {
        setGamesList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved games catalog:', e);
      }
    }
  }, []);

  // Live Timer Countdown Interval
  useEffect(() => {
    let interval: any = null;
    if (gameState.status === 'live') {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.status !== 'live') return prev;
          return {
            ...prev,
            elapsedSeconds: (prev.elapsedSeconds || 0) + 1
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.status]);

  // Dynamically set defaults for substitution selectors when team or state changes
  useEffect(() => {
    const teamObj = subTeam === 'away' ? gameState.awayTeam : gameState.homeTeam;
    if (teamObj && teamObj.battingOrder.length > 0) {
      setActiveSubId(teamObj.battingOrder[0]);
    } else {
      setActiveSubId('');
    }

    const bench = teamObj ? teamObj.roster.filter(p => !teamObj.battingOrder.includes(p.id)) : [];
    if (bench.length > 0) {
      setBenchSubId(bench[0].id);
    } else {
      setBenchSubId('');
    }
  }, [subTeam, gameState.awayTeam.battingOrder, gameState.homeTeam.battingOrder, gameState.status]);

  // Quick helper to mutate state after pushing current state to the Undo stack
  const updateStateWithHistory = (updater: (prev: GameState) => GameState) => {
    setGameState(prev => {
      // Save deep copy of previous state as JSON string
      const serialized = JSON.stringify(prev);
      setHistoryStack(stack => [...stack, serialized]);
      
      const nextState = updater(prev);
      return nextState;
    });
  };

  const handleLanguageToggle = () => {
    setLanguage(prev => (prev === 'en' ? 'ms' : 'en'));
  };

  const t = TRANSLATIONS[language];
  const isEn = language === 'en';

  const addGameLog = (updated: GameState, enMsg: string, msMsg: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const newLog: GameEvent = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: currentTime,
      inning: updated.currentInning,
      isTop: updated.isTopInning,
      messageEn: enMsg,
      messageMs: msMsg,
      score: `${updated.awayTeam.name.substring(0, 3).toUpperCase()} ${updated.awayRunsTotal} - ${updated.homeRunsTotal} ${updated.homeTeam.name.substring(0, 3).toUpperCase()}`,
    };
    updated.logs = [newLog, ...updated.logs];
  };

  // Setup / Initialize a completely fresh game
  const handleCreateNewGame = () => {
    setGameState(createBlankGame());
    setHistoryStack([]);
  };

  // Start Live scoring mode
  const handleStartGame = () => {
    setGameState(prev => {
      const updated = { ...prev };
      updated.status = 'live';
      updated.startTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      updated.elapsedSeconds = 0;
      
      // Initialize raw inning structures if empty
      const activeInning = updated.inningScores.find(s => s.inning === 1);
      if (activeInning) {
        activeInning.awayRuns = 0;
        activeInning.homeRuns = null;
      }

      addGameLog(
        updated,
        `Play Ball! Game started. Top 1st: ${updated.awayTeam.name} batting.`,
        `Mulakan Perlawanan! Atas Ining 1: Pasukan ${updated.awayTeam.name} memukul.`
      );
      return updated;
    });
    setHistoryStack([]);
  };

  // Base Runner manual toggles from the SVG map
  const handleToggleBase = (base: 'first' | 'second' | 'third') => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      updated.runners[base] = !updated.runners[base];
      
      const baseLabel = base === 'first' ? '1st' : base === 'second' ? '2nd' : '3rd';
      const baseLabelMs = base === 'first' ? 'Pertama' : base === 'second' ? 'Kedua' : 'Ketiga';
      const stateLabelEn = updated.runners[base] ? 'placed on' : 'removed from';
      const stateLabelMs = updated.runners[base] ? 'diletakkan di' : 'dikeluarkan dari';

      addGameLog(
        updated,
        `Runner manually ${stateLabelEn} ${baseLabel} Base.`,
        `Pelari ${stateLabelMs} Tapak ${baseLabelMs} oleh pencatat.`
      );
      return updated;
    });
  };

  // BALL LOGIC
  const handleLogBall = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      
      // Get current pitcher
      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.ballsThrown += 1;
      }

      const nextBalls = updated.balls + 1;
      if (nextBalls >= 4) {
        // Walk (Base on Balls) occurs
        updated.balls = 0;
        updated.strikes = 0;
        
        // Batter details
        const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
        const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
        const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
        const batter = battingTeam.roster.find(p => p.id === batterId);

        if (batter) {
          batter.walks += 1;
        }

        // Advance runners due to push force
        let runScored = false;
        const newRunners = { ...updated.runners };

        if (!updated.runners.first) {
          newRunners.first = true;
        } else if (!updated.runners.second) {
          newRunners.second = true;
          newRunners.first = true;
        } else if (!updated.runners.third) {
          newRunners.third = true;
          newRunners.second = true;
          newRunners.first = true;
        } else {
          // Bases Loaded, walk scores a run!
          runScored = true;
          newRunners.first = true;
          newRunners.second = true;
          newRunners.third = true;
        }

        if (runScored) {
          if (updated.isTopInning) {
            updated.awayRunsTotal += 1;
          } else {
            updated.homeRunsTotal += 1;
          }
          // Increment in current Inning scorecard
          const activeInningObj = updated.inningScores.find(s => s.inning === updated.currentInning);
          if (activeInningObj) {
            if (updated.isTopInning) {
              activeInningObj.awayRuns = (activeInningObj.awayRuns || 0) + 1;
            } else {
              activeInningObj.homeRuns = (activeInningObj.homeRuns || 0) + 1;
            }
          }
          if (pitcher) pitcher.runsAllowed += 1;
          if (batter) batter.rbis += 1;
        }

        updated.runners = newRunners;
        
        // Next batter in queue
        if (updated.isTopInning) {
          updated.currentBatterIndex.away += 1;
        } else {
          updated.currentBatterIndex.home += 1;
        }

        addGameLog(
          updated,
          `Ball 4! ${batter ? batter.name : 'Batter'} walks to 1st Base.${runScored ? ' Run scores!' : ''}`,
          `Bola Ke-4! Pemukul ${batter ? batter.name : 'Pemain'} berjalan ke Tapak Pertama.${runScored ? ' Larian dijaringkan!' : ''}`
        );
      } else {
        updated.balls = nextBalls;
        addGameLog(updated, 'Pitch logged as Ball.', 'Balingan Bola.');
      }

      return updated;
    });
  };

  // STRIKE LOGIC
  const handleLogStrike = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      
      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.strikesThrown += 1;
      }

      const nextStrikes = updated.strikes + 1;
      if (nextStrikes >= 3) {
        // Strikeout Out!
        updated.balls = 0;
        updated.strikes = 0;

        const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
        const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
        const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
        const batter = battingTeam.roster.find(p => p.id === batterId);

        if (batter) {
          batter.atBats += 1;
          batter.strikeouts += 1;
        }
        if (pitcher) {
          pitcher.strikeoutsThrown += 1;
        }

        updated.outs += 1;

        // Next batter
        if (updated.isTopInning) {
          updated.currentBatterIndex.away += 1;
        } else {
          updated.currentBatterIndex.home += 1;
        }

        addGameLog(
          updated,
          `Strike 3! Strikeout on ${batter ? batter.name : 'batter'}.`,
          `Strik Ke-3! Strik-Keluar (Strikeout) ke atas pemukul ${batter ? batter.name : 'pemain'}.`
        );

        // Check for 3 outs and handle inning transition
        if (updated.outs >= 3) {
          handleInningTransition(updated);
        }
      } else {
        updated.strikes = nextStrikes;
        addGameLog(updated, 'Pitch logged as Strike.', 'Balingan Strik.');
      }

      return updated;
    });
  };

  // FOUL LOGIC
  const handleLogFoul = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.strikesThrown += 1;
      }

      // Foul counts as strike ONLY if current strikes is less than 2
      if (updated.strikes < 2) {
        updated.strikes += 1;
      }

      addGameLog(updated, 'Foul Ball logged.', 'Bola Foul direkodkan.');
      return updated;
    });
  };

  // WALK DIRECT LOGIC
  const handleLogWalk = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      
      const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
      const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
      const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
      const batter = battingTeam.roster.find(p => p.id === batterId);

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (batter) {
        // Walks do NOT count as standard At-bats for average, but count as walk
        batter.walks += 1;
      }

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.ballsThrown += 1;
        pitcher.walksThrown += 1;
      }

      // Reset count
      updated.balls = 0;
      updated.strikes = 0;

      // Advance runners realistically
      let runScored = false;
      const newRunners = { ...updated.runners };

      if (!updated.runners.first) {
        newRunners.first = true;
      } else if (!updated.runners.second) {
        newRunners.second = true;
        newRunners.first = true;
      } else if (!updated.runners.third) {
        newRunners.third = true;
        newRunners.second = true;
        newRunners.first = true;
      } else {
        runScored = true;
        newRunners.first = true;
        newRunners.second = true;
        newRunners.third = true;
      }

      if (runScored) {
        if (updated.isTopInning) {
          updated.awayRunsTotal += 1;
        } else {
          updated.homeRunsTotal += 1;
        }

        const activeInningObj = updated.inningScores.find(s => s.inning === updated.currentInning);
        if (activeInningObj) {
          if (updated.isTopInning) {
            activeInningObj.awayRuns = (activeInningObj.awayRuns || 0) + 1;
          } else {
            activeInningObj.homeRuns = (activeInningObj.homeRuns || 0) + 1;
          }
        }
        if (pitcher) pitcher.runsAllowed += 1;
        if (batter) batter.rbis += 1;
      }

      updated.runners = newRunners;

      if (updated.isTopInning) {
        updated.currentBatterIndex.away += 1;
      } else {
        updated.currentBatterIndex.home += 1;
      }

      addGameLog(
        updated,
        `Batter ${batter ? batter.name : ''} awarded Walk (Base on Balls).`,
        `Pemukul ${batter ? batter.name : ''} dikurniakan Larian Percuma (Walk/BB).`
      );

      return updated;
    });
  };

  // REACH ON FIELD SPECIAL ERROR LOGIC
  const handleLogError = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };

      const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
      const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
      const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
      const batter = battingTeam.roster.find(p => p.id === batterId);

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (batter) {
        // Encase under normal at-bats but no hits are credited (reaches on error)
        batter.atBats += 1;
      }

      if (pitcher) {
        pitcher.pitchesThrown += 1;
      }

      // Increment opposing team's catalogued errors
      if (updated.isTopInning) {
        updated.homeErrorsTotal += 1;
      } else {
        updated.awayErrorsTotal += 1;
      }

      // Reset batter balls and strikes
      updated.balls = 0;
      updated.strikes = 0;

      // Force-advance batter to first base
      const newRunners = { ...updated.runners };
      if (!newRunners.first) {
        newRunners.first = true;
      } else if (!newRunners.second) {
        newRunners.second = true;
        newRunners.first = true;
      } else {
        // Simple shift advance
        newRunners.third = true;
        newRunners.second = true;
        newRunners.first = true;
      }

      updated.runners = newRunners;

      if (updated.isTopInning) {
        updated.currentBatterIndex.away += 1;
      } else {
        updated.currentBatterIndex.home += 1;
      }

      addGameLog(
        updated,
        `Batter ${batter ? batter.name : 'Pemain'} reached 1st due to defensive Fielding Error (E).`,
        `Pemukul ${batter ? batter.name : 'Pemain'} ke Tapak Pertama atas Ralat Defensif (Error/E) pemadang.`
      );

      return updated;
    });
  };

  // SUCCESSFUL BATTING HITS LOGIC
  const handleLogHit = (bases: 1 | 2 | 3 | 4) => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };

      const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
      const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
      const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
      const batter = battingTeam.roster.find(p => p.id === batterId);

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      // Credit stats
      if (batter) {
        batter.atBats += 1;
        batter.hits += 1;
      }

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.strikesThrown += 1;
      }

      if (updated.isTopInning) {
        updated.awayHitsTotal += 1;
      } else {
        updated.homeHitsTotal += 1;
      }

      // Reset ball/strikes
      updated.balls = 0;
      updated.strikes = 0;

      let runsEarned = 0;
      const currentRunners = { ...updated.runners };
      const nextRunners = { first: false, second: false, third: false };

      const addRun = (byWhom?: string) => {
        runsEarned += 1;
        if (batter) batter.rbis += 1;
        if (pitcher) pitcher.runsAllowed += 1;

        // Credit scored running player stats
        if (byWhom) {
          const runner = battingTeam.roster.find(p => p.name === byWhom);
          if (runner) runner.runs += 1;
        } else if (batter) {
          batter.runs += 1;
        }
      };

      // Handle realistic base runner progression
      if (bases === 1) {
        // Single
        if (currentRunners.third) addRun();
        if (currentRunners.second) nextRunners.third = true;
        if (currentRunners.first) nextRunners.second = true;
        nextRunners.first = true;
      } else if (bases === 2) {
        // Double
        if (currentRunners.third) addRun();
        if (currentRunners.second) addRun();
        if (currentRunners.first) nextRunners.third = true;
        nextRunners.second = true;
      } else if (bases === 3) {
        // Triple
        if (currentRunners.third) addRun();
        if (currentRunners.second) addRun();
        if (currentRunners.first) addRun();
        nextRunners.third = true;
      } else if (bases === 4) {
        // Home Run (HR)
        if (currentRunners.third) addRun();
        if (currentRunners.second) addRun();
        if (currentRunners.first) addRun();
        addRun(); // Batter run
      }

      updated.runners = nextRunners;

      if (runsEarned > 0) {
        if (updated.isTopInning) {
          updated.awayRunsTotal += runsEarned;
        } else {
          updated.homeRunsTotal += runsEarned;
        }

        // Add to InningScores tally
        const currentInningScore = updated.inningScores.find(s => s.inning === updated.currentInning);
        if (currentInningScore) {
          if (updated.isTopInning) {
            currentInningScore.awayRuns = (currentInningScore.awayRuns || 0) + runsEarned;
          } else {
            currentInningScore.homeRuns = (currentInningScore.homeRuns || 0) + runsEarned;
          }
        }
      }

      // Next batter index
      if (updated.isTopInning) {
        updated.currentBatterIndex.away += 1;
      } else {
        updated.currentBatterIndex.home += 1;
      }

      const hitsLabels = ['Single', 'Double', 'Triple', 'Home Run'];
      const hitsLabelsMs = ['Hit 1-Tapak (Single)', 'Hit 2-Tapak (Double)', 'Hit 3-Tapak (Triple)', 'Larian Penuh (Home Run)'];
      
      const hitTypeEn = hitsLabels[bases - 1];
      const hitTypeMs = hitsLabelsMs[bases - 1];

      let msgEn = `${batter ? batter.name : 'Batter'} hit a ${hitTypeEn}!`;
      let msgMs = `${batter ? batter.name : 'Pemukul'} mencatatkan ${hitTypeMs}!`;
      if (runsEarned > 0) {
        msgEn += ` ${runsEarned} run(s) scored!`;
        msgMs += ` ${runsEarned} larian berjaya dijaringkan!`;
      }

      addGameLog(updated, msgEn, msgMs);
      return updated;
    });
  };

  // LOGOUT GENERAL BUTTON LOGIC
  const handleLogOut = (outType: 'strikeout' | 'groundout' | 'flyout') => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };

      const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
      const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
      const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
      const batter = battingTeam.roster.find(p => p.id === batterId);

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      if (batter) {
        batter.atBats += 1;
        if (outType === 'strikeout') {
          batter.strikeouts += 1;
        }
      }

      if (pitcher) {
        pitcher.pitchesThrown += 1;
        pitcher.strikesThrown += 1;
        if (outType === 'strikeout') {
          pitcher.strikeoutsThrown += 1;
        }
      }

      updated.balls = 0;
      updated.strikes = 0;
      updated.outs += 1;

      // Next Batter
      if (updated.isTopInning) {
        updated.currentBatterIndex.away += 1;
      } else {
        updated.currentBatterIndex.home += 1;
      }

      const labelEn = outType === 'strikeout' ? 'Strikeout' : outType === 'groundout' ? 'Ground Out' : 'Fly Out';
      const labelMs = outType === 'strikeout' ? 'Strik-keluar' : outType === 'groundout' ? 'Mati Padang (Ground Out)' : 'Mati Sasar (Fly Out)';

      addGameLog(
        updated,
        `Play Out: ${batter ? batter.name : 'Batter'} is retired on ${labelEn}.`,
        `Mati Padang: Pemukul ${batter ? batter.name : 'Pemain'} terkeluar secara ${labelMs}.`
      );

      if (updated.outs >= 3) {
        handleInningTransition(updated);
      }

      return updated;
    });
  };

  // INNING SHUTDOWNS / SIDE SWAPS CONTROL
  const handleInningTransition = (updated: GameState) => {
    const wasTop = updated.isTopInning;
    
    if (wasTop) {
      // Top ends, Bottom begins (Home batting, Away field)
      updated.isTopInning = false;
      updated.outs = 0;
      updated.balls = 0;
      updated.strikes = 0;
      updated.runners = { first: false, second: false, third: false };

      // Initialize Home score for this inning
      const currentInningScore = updated.inningScores.find(s => s.inning === updated.currentInning);
      if (currentInningScore) {
        currentInningScore.homeRuns = 0;
      }

      addGameLog(
        updated,
        `Middle of inning ${updated.currentInning}. Bottom of ${updated.currentInning} beginning. ${updated.homeTeam.name} batting.`,
        `Tengah ining ke-${updated.currentInning}. Bawah ining ke-${updated.currentInning} bermula. Pasukan ${updated.homeTeam.name} mengambil giliran memukul.`
      );
    } else {
      // Inning bottom ends, Next top begins (Away batting)
      const nextInning = updated.currentInning + 1;
      updated.currentInning = nextInning;
      updated.isTopInning = true;
      updated.outs = 0;
      updated.balls = 0;
      updated.strikes = 0;
      updated.runners = { first: false, second: false, third: false };

      // Append new inning object to array to prevent out of bounds
      const nextInningScore: InningScore = {
        inning: nextInning,
        awayRuns: 0,
        homeRuns: null
      };
      updated.inningScores.push(nextInningScore);

      addGameLog(
        updated,
        `Inning transition! Top of ${nextInning} beginning. ${updated.awayTeam.name} batting.`,
        `Pertukaran ining! Atas ining ke-${nextInning} bermula. Pasukan ${updated.awayTeam.name} mengambil giliran memukul.`
      );
    }
  };

  // ADMIN FORCE CLEANUPS
  const handleResetCount = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      updated.balls = 0;
      updated.strikes = 0;
      addGameLog(updated, 'Balls & Strikes count reset to 0-0.', 'Tetap semula kiraan Ball & Strike kepada 0-0.');
      return updated;
    });
  };

  const handleClearBases = () => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      updated.runners = { first: false, second: false, third: false };
      addGameLog(updated, 'Bases cleared manually.', 'Tapak dikosongkan secara manual oleh pencatat.');
      return updated;
    });
  };

  // UNDO LAST PLAY OPERATOR
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    
    const nextHistory = [...historyStack];
    const rawPrevState = nextHistory.pop();
    
    if (rawPrevState) {
      try {
        setGameState(JSON.parse(rawPrevState));
        setHistoryStack(nextHistory);
      } catch (e) {
        console.error('Failed to parse previous state during undo stack extraction:', e);
      }
    }
  };

  // CUSTOM WBSC INTEGRATED SCOREPLAY LOGGER
  const handleLogCustomWbscPlay = (params: {
    symbol: string;
    description: string;
    playerName: string;
    addOuts: number;
    addHits: boolean;
    addRuns: boolean;
    addError: boolean;
    resetCount: boolean;
    clearBases: boolean;
  }) => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      const { symbol, description, playerName, addOuts, addHits, addRuns, addError, resetCount, clearBases } = params;

      const battingTeam = updated.isTopInning ? updated.awayTeam : updated.homeTeam;
      const batterIdx = updated.isTopInning ? updated.currentBatterIndex.away : updated.currentBatterIndex.home;
      const batterId = battingTeam.battingOrder[batterIdx % battingTeam.battingOrder.length];
      const batter = battingTeam.roster.find(p => p.id === batterId);

      const defensiveTeam = updated.isTopInning ? updated.homeTeam : updated.awayTeam;
      const pitcherId = updated.isTopInning ? updated.currentPitcherId.home : updated.currentPitcherId.away;
      const pitcher = defensiveTeam.roster.find(p => p.id === pitcherId) || defensiveTeam.roster[0];

      // 1. Credit core atBats stats if relevant
      const isPlateAppearance = ['1B', '2B', '3B', 'HR', 'BB', 'IBB', 'HBP', 'K', '■', 'SAC', 'SF', 'FC', 'E', 'CI', 'F7', 'F8', 'F9', 'L6', '6-3', '5-3', '4-3', 'U3', 'DP', 'TP'].includes(symbol);
      
      // Update individual batter stats
      const subjectPlayerName = playerName.trim();
      const subjectPlayer = battingTeam.roster.find(p => p.name.toLowerCase() === subjectPlayerName.toLowerCase()) || batter;

      if (isPlateAppearance && subjectPlayer) {
        subjectPlayer.atBats += 1;
        if (symbol === 'K' || symbol === '■') {
          subjectPlayer.strikeouts += 1;
        }
      }

      // 2. Incremental hits
      if (addHits) {
        if (updated.isTopInning) {
          updated.awayHitsTotal += 1;
        } else {
          updated.homeHitsTotal += 1;
        }
        if (subjectPlayer) {
          subjectPlayer.hits += 1;
        }
      }

      // 3. Incremental runs
      if (addRuns) {
        if (updated.isTopInning) {
          updated.awayRunsTotal += 1;
        } else {
          updated.homeRunsTotal += 1;
        }

        // Add to InningScores tally
        const currentInningScore = updated.inningScores.find(s => s.inning === updated.currentInning);
        if (currentInningScore) {
          if (updated.isTopInning) {
            currentInningScore.awayRuns = (currentInningScore.awayRuns || 0) + 1;
          } else {
            currentInningScore.homeRuns = (currentInningScore.homeRuns || 0) + 1;
          }
        }

        // Who scored?
        if (subjectPlayer) {
          subjectPlayer.runs += 1;
        }
        if (batter && subjectPlayer && batter.id !== subjectPlayer.id) {
          batter.rbis += 1; // Credit active batter with RBI
        }
      }

      // 4. Incremental defensive errors
      if (addError) {
        if (updated.isTopInning) {
          updated.homeErrorsTotal += 1;
        } else {
          updated.awayErrorsTotal += 1;
        }
      }

      // 5. Update defense Pitcher pitch count metrics
      if (pitcher) {
        pitcher.pitchesThrown += 1;
        if (symbol === 'K' || symbol === '■') {
          pitcher.strikesThrown += 1;
          pitcher.strikeoutsThrown += 1;
        } else if (addOuts > 0) {
          pitcher.strikesThrown += 1;
        }
        if (addRuns) {
          pitcher.runsAllowed += 1;
        }
      }

      // 6. Incremental Outs tally
      if (addOuts > 0) {
        updated.outs += addOuts;
      }

      // 7. Base runners modifications
      if (clearBases) {
        updated.runners = { first: false, second: false, third: false };
      } else if (symbol === '1B' || symbol === 'BB' || symbol === 'HBP') {
        // Advance runners logically
        const currentRunners = { ...updated.runners };
        const nextRunners = { ...currentRunners };
        if (currentRunners.first) nextRunners.second = true;
        nextRunners.first = true;
        updated.runners = nextRunners;
      } else if (symbol === '2B') {
        const currentRunners = { ...updated.runners };
        const nextRunners = { ...currentRunners };
        if (currentRunners.second) {
          updated.awayRunsTotal += updated.isTopInning ? 1 : 0;
          updated.homeRunsTotal += updated.isTopInning ? 0 : 1;
        }
        nextRunners.third = true;
        nextRunners.second = true;
        updated.runners = nextRunners;
      } else if (symbol === '3B') {
        updated.runners = { first: false, second: false, third: true };
      } else if (symbol === 'HR') {
        updated.runners = { first: false, second: false, third: false };
      }

      // 8. Resets ball/strikes
      if (resetCount) {
        updated.balls = 0;
        updated.strikes = 0;
      }

      // 9. Advance Batting order index if batter completed plate appearance
      if (isPlateAppearance) {
        if (updated.isTopInning) {
          updated.currentBatterIndex.away += 1;
        } else {
          updated.currentBatterIndex.home += 1;
        }
      }

      // 10. Generate logs
      const actEn = addRuns ? 'scored a run!' : addOuts > 0 ? 'was retired/outed.' : 'made a play.';
      const actMs = addRuns ? 'menjaringkan larian!' : addOuts > 0 ? 'dikeluarkan dari padang (out).' : 'melakukan gerakan play.';

      const outNoticeEn = addOuts > 0 ? ` (+${addOuts} Out)` : '';
      const logSubjectName = subjectPlayerName || (updated.isTopInning ? 'Away batter' : 'Home batter');

      const logEn = `[WBSC ${symbol}] ${logSubjectName}: ${description} - player ${actEn}${outNoticeEn}`;
      const logMs = `[WBSC ${symbol}] ${logSubjectName}: ${description} - pemain ${actMs}${outNoticeEn}`;

      addGameLog(updated, logEn, logMs);

      // Handle third out transitioning
      if (updated.outs >= 3) {
        handleInningTransition(updated);
      }

      return updated;
    });
  };

  // END THE GAME AND RECORD SUMMARY
  const handleEndGame = () => {
    setGameState(prev => {
      const updated = { ...prev };
      updated.status = 'finished';

      // Save to archives
      setGamesList(oldGames => {
        const foundIdx = oldGames.findIndex(g => g.id === updated.id);
        let updatedGamesList = [...oldGames];
        if (foundIdx > -1) {
          updatedGamesList[foundIdx] = updated;
        } else {
          updatedGamesList = [updated, ...updatedGamesList];
        }
        localStorage.setItem('softball_scorebook_games', JSON.stringify(updatedGamesList));
        return updatedGamesList;
      });

      addGameLog(
        updated,
        `Game Officially Finished! Final score: ${updated.awayRunsTotal} - ${updated.homeRunsTotal}.`,
        `Perlawanan Tamat Rasmi! Markah Akhir: ${updated.awayRunsTotal} - ${updated.homeRunsTotal}.`
      );

      return updated;
    });
  };

  // SELECT GAME FROM RETRIEVED ARCHIVES
  const handleLoadGame = (game: GameState) => {
    setGameState(game);
    setHistoryStack([]);
  };

  // LIVE SUBSTITUTION CONTROLLER
  const handleSubstitution = (teamType: 'away' | 'home', activeId: string, benchId: string) => {
    updateStateWithHistory(prev => {
      const updated = { ...prev };
      const team = teamType === 'away' ? updated.awayTeam : updated.homeTeam;
      
      const activePlayer = team.roster.find(p => p.id === activeId);
      const benchPlayer = team.roster.find(p => p.id === benchId);

      if (!activePlayer || !benchPlayer) return prev;

      // Swap active player's ID with bench player's ID in the starting batting order array
      const idx = team.battingOrder.indexOf(activeId);
      if (idx !== -1) {
        team.battingOrder[idx] = benchId;

        // If active player was pitching, change current pitcher to bench player
        if (activePlayer.position === 'P') {
          if (teamType === 'away') {
            updated.currentPitcherId.away = benchId;
          } else {
            updated.currentPitcherId.home = benchId;
          }
        }

        // Convey defensive position from outgoing player to incoming player
        const outgoingPos = activePlayer.position;
        benchPlayer.position = outgoingPos;
        activePlayer.position = 'DH'; // outgoing becomes Designated/Bench

        addGameLog(
          updated,
          `SUBSTITUTION: ${benchPlayer.name} (#${benchPlayer.number}) is subbed in for ${activePlayer.name} (#${activePlayer.number}) at position ${outgoingPos}.`,
          `PERTUKARAN PEMAIN: ${benchPlayer.name} (#${benchPlayer.number}) dimasukkan menggantikan ${activePlayer.name} (#${activePlayer.number}) pada posisi ${outgoingPos}.`
        );
      }

      return updated;
    });
  };

  // CLIENT SIDE TXT REPORT EXPORTER
  const handleDownloadReport = () => {
    // Generate text report
    let report = "";
    report += "=========================================================\n";
    report += "                       PUSINGBASE                        \n";
    report += "              LAPORAN PERLAWANAN SOFTBALL                \n";
    report += "=========================================================\n";
    report += `Hak Cipta Terpelihara: (C) 2026 Naim Osman\n`;
    report += `Tarikh Perlawanan / Date: ${gameState.date}\n`;
    report += `Masa Mula / Start Time: ${gameState.startTime || '---'}\n`;
    report += `Durasi Perlawanan / Duration: ${Math.floor((gameState.elapsedSeconds || 0) / 3600).toString().padStart(2, '0')}:${Math.floor(((gameState.elapsedSeconds || 0) % 3600) / 60).toString().padStart(2, '0')}:${((gameState.elapsedSeconds || 0) % 65) % 60}\n`;
    report += `Status: ${gameState.status === 'live' ? 'SEDANG BERLANGSUNG' : 'TAMAT'}\n`;
    report += `Skor Akhir / Score: ${gameState.awayTeam.name} [ ${gameState.awayRunsTotal} ] vs [ ${gameState.homeRunsTotal} ] ${gameState.homeTeam.name}\n`;
    report += "=========================================================\n\n";

    report += "PERINCIAN INING / INNINGS SUMMARY:\n";
    report += `Innings: | `;
    const totalInningsToShow = Math.max(7, gameState.currentInning);
    for (let i = 1; i <= totalInningsToShow; i++) {
      report += `${i} | `;
    }
    report += "R | H | E |\n";

    // Away Row
    report += `${gameState.awayTeam.name.padEnd(20).substring(0, 20)}: | `;
    for (let i = 1; i <= totalInningsToShow; i++) {
      const inn = gameState.inningScores.find(s => s.inning === i);
      const val = inn ? (inn.awayRuns === null ? '-' : String(inn.awayRuns)) : '-';
      report += `${val} | `;
    }
    report += `${gameState.awayRunsTotal} | ${gameState.awayHitsTotal} | ${gameState.awayErrorsTotal} |\n`;

    // Home Row
    report += `${gameState.homeTeam.name.padEnd(20).substring(0, 20)}: | `;
    for (let i = 1; i <= totalInningsToShow; i++) {
      const inn = gameState.inningScores.find(s => s.inning === i);
      const val = inn ? (inn.homeRuns === null ? '-' : String(inn.homeRuns)) : '-';
      report += `${val} | `;
    }
    report += `${gameState.homeRunsTotal} | ${gameState.homeHitsTotal} | ${gameState.homeErrorsTotal} |\n`;
    report += "---------------------------------------------------------\n\n";

    // Player stats table
    const renderTeamStatsTxt = (team: typeof gameState.awayTeam) => {
      let segment = "";
      segment += `PASUKAN: ${team.name}\n`;
      segment += `SUSUNAN MEMUKUL & STATS (BATTING ORDER & STATS):\n`;
      segment += ` Jersey | Pos | Nama Player          | AB | H | R | RBI | SO | BB | AVG \n`;
      team.battingOrder.forEach((pId, idx) => {
        const p = team.roster.find(player => player.id === pId);
        if (p) {
          const avgStr = p.atBats > 0 ? (p.hits / p.atBats).toFixed(3) : '.000';
          segment += ` #${p.number.padEnd(5)} | ${p.position.padEnd(3)} | ${p.name.padEnd(20).substring(0, 20)} | ${String(p.atBats).padEnd(2)} | ${String(p.hits).padEnd(1)} | ${String(p.runs).padEnd(1)} | ${String(p.rbis).padEnd(3)} | ${String(p.strikeouts).padEnd(2)} | ${String(p.walks).padEnd(2)} | ${avgStr} \n`;
        }
      });

      // Reservists
      const reservePlayers = team.roster.filter(p => !team.battingOrder.includes(p.id));
      if (reservePlayers.length > 0) {
        segment += `Reserve / Pemain Simpanan:\n`;
        reservePlayers.forEach(p => {
          segment += ` #${p.number.padEnd(5)} | Sim  | ${p.name.padEnd(20).substring(0, 20)} [SIMPANAN / BENCH]\n`;
        });
      }
      segment += "\n";
      return segment;
    };

    report += renderTeamStatsTxt(gameState.awayTeam);
    report += renderTeamStatsTxt(gameState.homeTeam);

    report += "=========================================================\n";
    report += "                 TINDAKAN PERLAWANAN LOG                 \n";
    report += "=========================================================\n";
    gameState.logs.forEach(log => {
      report += `[${log.timestamp}] Ining-${log.inning} (${log.isTop ? 'TOP' : 'BOT'}): ${log.messageMs} / ${log.messageEn} [${log.score}]\n`;
    });
    report += "\n======================== END REPORT =====================\n";

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PusingBase_${gameState.awayTeam.name.replace(/\s+/g, '_')}_vs_${gameState.homeTeam.name.replace(/\s+/g, '_')}_report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // DELETE MATCH RECORD
  const handleDeleteGame = (gameId: string) => {
    setGamesList(oldGames => {
      const filtered = oldGames.filter(g => g.id !== gameId);
      localStorage.setItem('softball_scorebook_games', JSON.stringify(filtered));
      return filtered;
    });
    
    // If the active viewed game was deleted, reset game
    if (gameState.id === gameId) {
      handleCreateNewGame();
    }
  };

  // Determine game status outcomes
  const awayWinner = gameState.awayRunsTotal > gameState.homeRunsTotal;
  const homeWinner = gameState.homeRunsTotal > gameState.awayRunsTotal;
  const isDraw = gameState.awayRunsTotal === gameState.homeRunsTotal;

  return (
    <div id="app-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-505 selection:text-white">
      
      {/* Top sticky navigation broadcast bar */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-450 to-indigo-650 flex items-center justify-center font-display text-lg font-black text-white shadow-md shadow-emerald-500/10">
              🥎
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-tight text-white md:text-base">
                {t.title}
              </h1>
              <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-wider uppercase">
                {isEn ? 'VITE SCOREBOOK v1.2' : 'BUKU SKOR DIGITAL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Malay-English Language switcher toggle button */}
            <button
              type="button"
              id="btn-lang-toggle"
              onClick={handleLanguageToggle}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition"
              title="Arah Bahasa / Switch Language"
            >
              <span>🌐</span>
              <span>{isEn ? 'MALAY' : 'ENGLISH'}</span>
            </button>

            {gameState.status !== 'setup' && (
              <button
                type="button"
                id="btn-return-setup"
                onClick={handleCreateNewGame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-855 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition"
                title={isEn ? "Generate New Game" : "Cipta Perlawanan Baru"}
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{t.newGame}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container Stage wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">
        
        {/* VIEW: Setup Screen  */}
        {gameState.status === 'setup' && (
          <div className="flex flex-col gap-6 md:gap-8 animate-fade-in">
            {/* Prompt Greeting bar */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 max-w-2xl">
              <h2 className="font-display font-extrabold text-lg text-slate-200">
                {isEn ? '🥎 Start Your Custom Match Recording' : '🥎 Mulakan Catatan Perlawanan Softball'}
              </h2>
              <p className="text-slate-405 text-xs leading-relaxed mt-2">
                {t.subtitle}
                <br />
                {isEn 
                  ? "We have preloaded both Malay & Global rosters so you can skip manually entering player profiles if you wish! Click 'Start Scorekeeping' below to test immediately."
                  : "Kami telah memuatkan praset jersi klasikal Melayu & All-Star supaya anda boleh mencuba penjejak dengan cepat tanpa penat menaip nama pemain!"}
              </p>
            </div>

            {/* Customizer settings module */}
            <RosterSetup
              gameState={gameState}
              onChangeGameState={updateStateWithHistory}
              onStartGame={handleStartGame}
              language={language}
            />

            {/* History Catalogues list */}
            {gamesList.length > 0 && (
              <HistoryList
                games={gamesList}
                onLoadGame={handleLoadGame}
                onDeleteGame={handleDeleteGame}
                language={language}
              />
            )}
          </div>
        )}

        {/* VIEW: Live Game Tracker view */}
        {gameState.status === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
            
            {/* Col-span-2: Scoreboard, Active Controllers and Stats Lists */}
            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
              
              {/* Scoreboard table */}
              <ScoreboardHeader gameState={gameState} language={language} />

              {/* Event logging and counts tracking controllers */}
              <LiveControls
                gameState={gameState}
                onLogStrike={handleLogStrike}
                onLogBall={handleLogBall}
                onLogFoul={handleLogFoul}
                onLogHit={handleLogHit}
                onLogOut={handleLogOut}
                onLogWalk={handleLogWalk}
                onLogError={handleLogError}
                onResetCount={handleResetCount}
                onClearBases={handleClearBases}
                onUndo={handleUndo}
                onEndGame={handleEndGame}
                language={language}
              />

              {/* Premium Panel: Pertukaran Live & Laporan Hub (Substitution & Reports Hub) */}
              <div id="subs-report-hub" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                      🔄 {isEn ? "Live Substitution & Reports Hub" : "Hub Pertukaran Live & Rekod"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isEn ? "Swap starting batters/defenders with reserve benches and generate files." : "Tukar pemain dalam padang dengan simpanan secara langsung & jana laporan."}
                    </p>
                  </div>
                  
                  {/* Download Report Button */}
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-550 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
                  >
                    📥 {isEn ? "Download Game Report (.txt)" : "Muat Turun Laporan (.txt)"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                  {/* Selector: Active Team */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                      {isEn ? "Select Team" : "Pilih Pasukan"}
                    </label>
                    <select
                      value={subTeam}
                      onChange={(e) => setSubTeam(e.target.value as 'away' | 'home')}
                      className="w-full text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-400 font-medium cursor-pointer"
                    >
                      <option value="away">🥎 {gameState.awayTeam.name} ({isEn ? 'Away' : 'Pelawat'})</option>
                      <option value="home">🏠 {gameState.homeTeam.name} ({isEn ? 'Home' : 'Tuan Rumah'})</option>
                    </select>
                  </div>

                  {/* Selector: Active Player (Starter) */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                      🏃‍♂️ {isEn ? "Sender Out (Active)" : "Pemain Keluar (Aktif)"}
                    </label>
                    <select
                      value={activeSubId}
                      onChange={(e) => setActiveSubId(e.target.value)}
                      className="w-full text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-400 font-medium font-mono cursor-pointer"
                    >
                      {(() => {
                        const teamObj = subTeam === 'away' ? gameState.awayTeam : gameState.homeTeam;
                        return teamObj.battingOrder.map((pId) => {
                          const p = teamObj.roster.find(player => player.id === pId);
                          return p ? (
                            <option key={p.id} value={p.id}>
                              #{p.number} - {p.name} ({p.position || 'DH'})
                            </option>
                          ) : null;
                        });
                      })()}
                    </select>
                  </div>

                  {/* Selector: Reserve Player (Bench) */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                      ➕ {isEn ? "Player In (Reserve)" : "Pemain Masuk (Simpanan)"}
                    </label>
                    <select
                      value={benchSubId}
                      onChange={(e) => setBenchSubId(e.target.value)}
                      className="w-full text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-400 font-medium font-mono cursor-pointer"
                    >
                      {(() => {
                        const teamObj = subTeam === 'away' ? gameState.awayTeam : gameState.homeTeam;
                        const reserves = teamObj.roster.filter(p => !teamObj.battingOrder.includes(p.id));
                        if (reserves.length === 0) {
                          return <option value="">⚠️ {isEn ? "No Reserves Left" : "Tiada Simpanan"}</option>;
                        }
                        return reserves.map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} - {p.name}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  {/* Substitution Trigger Button */}
                  <div>
                    <button
                      type="button"
                      disabled={!activeSubId || !benchSubId}
                      onClick={() => {
                        if (activeSubId && benchSubId) {
                          handleSubstitution(subTeam, activeSubId, benchSubId);
                        }
                      }}
                      className="w-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-400 border border-indigo-600 rounded-lg py-2.5 px-3 transition disabled:opacity-40 disabled:hover:bg-indigo-650 cursor-pointer"
                    >
                      🔄 {isEn ? "Execute Swap" : "Tukar Pemain"}
                    </button>
                  </div>
                </div>

                {/* Sub copyright credit */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>© 2026 NAIM OSMAN • PUSINGBASE LIVE INTEGRATION SYSTEM</span>
                  <span>v2.1ms</span>
                </div>
              </div>

              {/* Individual Roster and metrics list */}
              <StatsTable
                awayTeam={gameState.awayTeam}
                homeTeam={gameState.homeTeam}
                language={language}
              />

            </div>

            {/* Col-span-1: Play field layout map & Live Logging Stream */}
            <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 hierarchy-sidebar">
              
              {/* Tactical Diamond field base runners */}
              <BaseMap
                runners={gameState.runners}
                onToggleBase={handleToggleBase}
                language={language}
                gameState={gameState}
              />

              {/* Real-time Play-by-play event streaming */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-[380px]">
                <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
                  <h3 className="font-display text-xs font-bold text-slate-350 tracking-wider uppercase flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    {t.playHistory}
                  </h3>
                  <span className="text-[9px] font-mono bg-slate-850 px-2 py-0.5 rounded font-bold text-slate-450 border border-slate-75 *">
                    LIVE
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-800/50 flex flex-col gap-2.5">
                  {gameState.logs.map((log) => (
                    <div key={log.id} className="pt-2 text-xs leading-relaxed transition hover:text-slate-100">
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-505 font-mono font-semibold mb-0.5">
                        <span className="text-xs">
                          {log.isTop ? '▲' : '▼'} I-{log.inning}
                        </span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 font-medium">
                        {isEn ? log.messageEn : log.messageMs}
                      </p>
                      <div className="text-[9px] font-mono font-bold text-slate-500 text-right mt-0.5">
                        {log.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WBSC interactive handbook & scoring system */}
              <WbscCheatSheet
                gameState={gameState}
                onLogCustomWbscPlay={handleLogCustomWbscPlay}
                language={language}
              />

            </div>

          </div>
        )}

        {/* VIEW: Post-game Final Recap screen */}
        {gameState.status === 'finished' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-8 animate-fade-in-up">
            
            {/* Massive Gold Winners Celebration Card */}
            <div className="bg-gradient-to-r from-teal-550/20 via-slate-900 to-indigo-650/20 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/10 animate-bounce mb-4">
                👑
              </div>

              <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-amber-400">
                {t.congrats}
              </h2>

              {/* Display winning team banner */}
              <div className="text-xl md:text-2xl font-extrabold text-slate-100 mt-2">
                {awayWinner ? gameState.awayTeam.name : homeWinner ? gameState.homeTeam.name : 'Match Tied! (Sukan Seri)'}
              </div>

              <p className="text-sm text-slate-400 mt-1.5 font-mono">
                {isEn ? 'Match Officially Completed' : 'Keputusan Mutlak Perlawanan Akhir'} • {gameState.date}
              </p>

              {/* Big Final Score layout */}
              <div className="flex items-center justify-center gap-6 mt-6 pb-2">
                <div className="text-center">
                  <div className="text-[10px] font-mono tracking-widest text-rose-400 font-bold uppercase mb-1">
                    {gameState.awayTeam.name}
                  </div>
                  <div className="text-4xl md:text-5xl font-display font-black text-rose-400 font-bold">
                    {gameState.awayRunsTotal}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-500">:</div>
                <div className="text-center">
                  <div className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase mb-1">
                    {gameState.homeTeam.name}
                  </div>
                  <div className="text-4xl md:text-5xl font-display font-black text-emerald-400 font-bold">
                    {gameState.homeRunsTotal}
                  </div>
                </div>
              </div>
            </div>

            {/* Scoreboard recap */}
            <ScoreboardHeader gameState={gameState} language={language} />

            {/* Individual Stat aggregates */}
            <StatsTable
              awayTeam={gameState.awayTeam}
              homeTeam={gameState.homeTeam}
              language={language}
            />

            {/* Historic log trace overview list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="font-display font-bold text-sm text-slate-300 tracking-wider uppercase border-b border-slate-800 pb-3 mb-4">
                📄 {t.playHistory} Review
              </h3>
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 divide-y divide-slate-800/40">
                {gameState.logs.map((log) => (
                  <div key={log.id} className="pt-3 text-xs flex justify-between gap-4">
                    <div>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] mr-2">
                        {log.isTop ? '▲' : '▼'} I-{log.inning}
                      </span>
                      <span className="text-slate-300 font-medium">
                        {isEn ? log.messageEn : log.messageMs}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 font-semibold">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4">
              <button
                type="button"
                id="btn-download-recap"
                onClick={handleDownloadReport}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-550 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                📥 {isEn ? 'Download Match Report (TXT)' : 'Muat Turun Laporan Perlawanan (TXT)'}
              </button>
              <button
                type="button"
                id="btn-back-setup-recap"
                onClick={handleCreateNewGame}
                className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isEn ? 'Create New Match' : 'Kembali Ke Menu Utama'}
              </button>
            </div>

          </div>
         )}

      </main>

      {/* Humble aesthetic minimalist footer */}
      <footer className="bg-slate-905 border-t border-slate-900/60 py-6 px-4 text-center mt-auto z-10">
        <p className="text-[10.5px] font-mono text-slate-400 tracking-wider">
          © 2026 Naim Osman. Hak Cipta Terpelihara. Crafted for Softball Scorers and Coaches.
        </p>
      </footer>
    </div>
  );
}
