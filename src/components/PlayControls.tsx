import React, { useRef, useState, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1,
  Volume2, Volume1, VolumeX,
  Heart, Music, Maximize2
} from 'lucide-react';
import type { Song, RepeatMode } from '../../types';

interface PlayerControlsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onSeek: (t: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleLike: () => void;
  onExpand: () => void;
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSong, isPlaying, currentTime, duration, volume,
  isShuffle, repeatMode, isLiked,
  onTogglePlayPause, onSkipNext, onSkipPrev, onSeek, onVolumeChange,
  onToggleShuffle, onCycleRepeat, onToggleLike, onExpand
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (currentSong) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSong?.id]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleBarClick = (ref: React.RefObject<HTMLDivElement | null>, setter: (ratio: number) => void) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = ref.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setter(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };

  const seekFromRatio = (r: number) => onSeek(r * duration);
  const volFromRatio = (r: number) => onVolumeChange(r);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <footer className="bg-[#050505]/95 backdrop-blur-2xl border-t border-white/[0.03] select-none z-30 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" id="player-controls">

      {/* ── Mobile progress line ── */}
      <div
        ref={mobileProgressRef}
        className="md:hidden h-[3px] bg-white/[0.06] cursor-pointer relative"
        onClick={handleBarClick(mobileProgressRef, seekFromRatio)}
      >
        <div className="h-full bg-emerald-400 transition-[width] duration-150 ease-linear shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${pct}%` }} />
      </div>

      <div className="h-[64px] md:h-24 px-3 md:px-6 lg:px-8 flex items-center justify-between">

        {/* ── LEFT: Now Playing ── */}
        <div className="flex items-center gap-3 w-full md:w-[30%] lg:w-1/3 min-w-0 pr-2">
          {currentSong ? (
            <>
              <div className="relative">
                <div 
                  className="w-10 h-10 md:w-14 md:h-14 bg-zinc-900 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer group relative shadow-md"
                  onClick={onExpand}
                >
                  {currentSong.imageUrl ? (
                    <img src={currentSong.imageUrl} alt="cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Music size={20} className="text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center transition-opacity">
                    <Maximize2 size={16} className="text-white" />
                  </div>
                </div>
                
                {/* Tooltip / Toast */}
                {showToast && (
                  <div className="absolute -top-12 left-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-fade-in z-50 pointer-events-none transition-opacity duration-300">
                    Click to Enable Full Screen
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-emerald-500 rotate-45" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={onExpand}>
                <span className="text-sm text-white font-bold truncate hover:underline">{currentSong.title}</span>
                <span className="text-[11px] text-zinc-500 truncate mt-0.5">{currentSong.artist}</span>
              </div>
              
              {/* Mobile Play/Pause (only shown on small screens) */}
              <div className="flex items-center md:hidden pl-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePlayPause(); }}
                  className="w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                </button>
              </div>

              <button
                onClick={onToggleLike}
                className={`hidden md:block flex-shrink-0 ml-2 transition-colors duration-200 ${
                  isLiked ? 'text-emerald-400' : 'text-zinc-600 hover:text-white'
                }`}
                aria-label={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-900 rounded-lg md:rounded-xl flex-shrink-0" />
              <span className="text-sm text-zinc-600 font-medium">No track selected</span>
            </div>
          )}
        </div>

        {/* ── CENTER: Controls + Progress (Desktop only) ── */}
        <div className="hidden md:flex flex-col items-center flex-1 max-w-[45%]">
          {/* Buttons */}
          <div className="flex items-center gap-6 mb-2">
            <button
              onClick={onToggleShuffle}
              className={`transition-all duration-200 hover:scale-110 ${isShuffle ? 'text-emerald-400' : 'text-zinc-600 hover:text-white'}`}
              aria-label="Shuffle"
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={onSkipPrev}
              disabled={!currentSong}
              className="text-zinc-400 hover:text-white transition-all duration-150 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
            >
              <SkipBack size={22} className="fill-current" />
            </button>

            <button
              onClick={onTogglePlayPause}
              disabled={!currentSong}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:scale-105 active:scale-95 transition-all text-black shadow-lg disabled:opacity-40 disabled:hover:scale-100"
            >
              {isPlaying
                ? <Pause size={20} className="fill-current" />
                : <Play size={20} className="fill-current ml-1" />}
            </button>

            <button
              onClick={onSkipNext}
              disabled={!currentSong}
              className="text-zinc-400 hover:text-white transition-all duration-150 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
            >
              <SkipForward size={22} className="fill-current" />
            </button>
            <button
              onClick={onCycleRepeat}
              className={`transition-all duration-200 hover:scale-110 relative ${
                repeatMode !== 'off' ? 'text-emerald-400' : 'text-zinc-600 hover:text-white'
              }`}
            >
              <RepeatIcon size={18} />
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 w-full text-[11px] text-zinc-500 font-mono tabular-nums">
            <span className="w-10 text-right">{fmt(currentTime)}</span>
            <div
              ref={progressRef}
              className="h-1.5 bg-white/[0.06] rounded-full flex-1 cursor-pointer group relative overflow-hidden"
              onClick={handleBarClick(progressRef, seekFromRatio)}
            >
              <div
                className="h-full bg-white group-hover:bg-emerald-400 rounded-full relative transition-colors duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10">{fmt(duration)}</span>
          </div>
        </div>

        {/* ── RIGHT: Volume & Expand (Desktop only) ── */}
        <div className="hidden md:flex items-center justify-end gap-4 w-[30%] lg:w-1/3 min-w-[140px]">
          <button 
            className="text-zinc-400 hover:text-white transition-colors"
            onClick={onExpand}
            title="Full Screen"
          >
            <Maximize2 size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <VolumeIcon size={18} />
            </button>
            <div
              ref={volumeRef}
              className="w-24 lg:w-28 h-1.5 bg-white/[0.06] rounded-full cursor-pointer group relative overflow-hidden"
              onClick={handleBarClick(volumeRef, volFromRatio)}
            >
              <div
                className="h-full bg-white/60 group-hover:bg-emerald-400 rounded-full relative transition-colors duration-150"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PlayerControls;