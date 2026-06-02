import React, { useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, ChevronDown, Music
} from 'lucide-react';
import type { Song, RepeatMode } from '../../types';

interface NowPlayingScreenProps {
  song: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onSeek: (t: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleLike: () => void;
  onClose: () => void;
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  song, isPlaying, currentTime, duration,
  isShuffle, repeatMode, isLiked,
  onTogglePlayPause, onSkipNext, onSkipPrev, onSeek,
  onToggleShuffle, onCycleRepeat, onToggleLike, onClose
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  
  // Dummy visualizer bars
  const bars = Array.from({ length: 40 }, () => Math.random() * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] animate-slide-in overflow-y-auto overflow-x-hidden h-[100dvh] w-[100dvw]">
      {/* Background Image with blur and gradient overlay */}
      {song.imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-[80px] scale-110 pointer-events-none transition-all duration-1000 fixed"
          style={{ backgroundImage: `url(${song.imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#050505]/90 to-[#050505] pointer-events-none fixed" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-8 flex-shrink-0">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white transition-all hover:-translate-y-0.5"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Now Playing</div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between lg:justify-center p-4 sm:p-6 md:p-12 gap-8 lg:gap-20 max-w-7xl mx-auto w-full min-h-0">
        
        {/* Album Art (Moves to top on mobile) */}
        <div className="order-1 lg:order-2 flex justify-center w-full max-w-[280px] sm:max-w-sm lg:max-w-lg mx-auto flex-shrink-0">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 group">
            {song.imageUrl ? (
              <img 
                src={song.imageUrl} 
                alt="Album Cover" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                <Music size={80} className="text-zinc-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Info & Controls */}
        <div className="order-2 lg:order-1 flex flex-col w-full max-w-lg lg:text-left text-center flex-shrink-0">
          <p className="text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-2 sm:mb-4 opacity-80">
            {song.artist}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-2 sm:mb-4 leading-tight line-clamp-2">
            {song.title}
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-medium mb-6 sm:mb-8">
            Listening to local library
          </p>

          {/* Fake Visualizer */}
          <div className="hidden sm:flex w-full h-16 lg:h-20 mb-8 items-end justify-center lg:justify-start gap-1 opacity-60">
            {bars.map((h, i) => (
              <div 
                key={i} 
                className={`w-1.5 rounded-t-sm transition-all duration-75 ${isPlaying ? 'bg-gradient-to-t from-emerald-500/20 to-emerald-400' : 'bg-white/10 h-2'}`}
                style={{ height: isPlaying ? `${Math.max(10, h)}%` : '10%' }}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-xs font-mono text-white/50 w-8 text-right">{fmt(currentTime)}</span>
            <div
              ref={progressRef}
              className="h-2 bg-white/10 rounded-full flex-1 cursor-pointer group relative overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full relative transition-all duration-150 ease-linear shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-white/50 w-8">{fmt(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pb-8">
            <button
              onClick={onToggleLike}
              className={`transition-colors duration-200 hover:scale-110 ${isLiked ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-white/50 hover:text-white'}`}
            >
              <Heart size={22} className={isLiked ? 'fill-current' : ''} />
            </button>
            
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <button
                onClick={onToggleShuffle}
                className={`transition-all duration-200 hover:scale-110 ${isShuffle ? 'text-emerald-400' : 'text-white/50 hover:text-white'}`}
              >
                <Shuffle size={20} />
              </button>

              <button
                onClick={onSkipPrev}
                className="text-white hover:text-emerald-400 transition-all duration-200 hover:scale-110 drop-shadow-md"
              >
                <SkipBack size={24} className="fill-current sm:w-7 sm:h-7" />
              </button>

              <button
                onClick={onTogglePlayPause}
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full hover:scale-105 active:scale-95 transition-all text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                {isPlaying
                  ? <Pause size={28} className="fill-current" />
                  : <Play size={28} className="fill-current ml-2" />}
              </button>

              <button
                onClick={onSkipNext}
                className="text-white hover:text-emerald-400 transition-all duration-200 hover:scale-110 drop-shadow-md"
              >
                <SkipForward size={24} className="fill-current sm:w-7 sm:h-7" />
              </button>

              <button
                onClick={onCycleRepeat}
                className={`transition-all duration-200 hover:scale-110 relative ${repeatMode !== 'off' ? 'text-emerald-400' : 'text-white/50 hover:text-white'}`}
              >
                <RepeatIcon size={20} />
                {repeatMode !== 'off' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Placeholder for empty space balancing */}
            <div className="w-[22px]" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default NowPlayingScreen;
