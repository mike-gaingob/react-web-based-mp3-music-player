import React, { useState } from 'react';
import { Heart, Play, MoreHorizontal } from 'lucide-react';
import type { Song, Playlist } from '../../types';

interface SongItemProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  isCurrentSong: boolean;
  isLiked: boolean;
  onPlay: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, songId: string) => void;
  compact?: boolean;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SongItem: React.FC<SongItemProps> = ({
  song, index, isPlaying, isCurrentSong, isLiked,
  onPlay, onToggleLike, playlists, onAddToPlaylist, compact = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const userPlaylists = playlists?.filter(p => !p.isDefault) ?? [];

  return (
    <div
      className={`group flex items-center gap-3 ${compact ? 'px-3 py-2' : 'px-4 py-2.5 md:py-3'} rounded-lg cursor-pointer transition-all duration-200 ${
        isCurrentSong ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
      }`}
      onClick={() => onPlay(song)}
    >
      {/* # / now-playing indicator */}
      <div className={`w-6 flex-shrink-0 text-center ${compact ? 'text-[11px]' : 'text-sm'}`}>
        {isCurrentSong && isPlaying ? (
          <div className="now-playing-bars"><span /><span /><span /></div>
        ) : (
          <>
            <span className={`${isCurrentSong ? 'text-emerald-400' : 'text-zinc-600'} group-hover:hidden`}>
              {index + 1}
            </span>
            <Play size={13} className="text-white hidden group-hover:block mx-auto fill-current" />
          </>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-[13px]'} font-medium truncate ${
          isCurrentSong ? 'text-emerald-400' : 'text-zinc-100'
        }`}>
          {song.title}
        </p>
        {!compact && (
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{song.artist}</p>
        )}
      </div>

      {/* Like */}
      <button
        onClick={e => { e.stopPropagation(); onToggleLike(song.id); }}
        className={`flex-shrink-0 transition-all duration-200 ${
          isLiked
            ? 'text-emerald-400 opacity-100'
            : 'text-zinc-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-white'
        }`}
        aria-label={isLiked ? 'Unlike song' : 'Like song'}
      >
        <Heart size={compact ? 14 : 16} className={isLiked ? 'fill-current' : ''} />
      </button>

      {/* More menu */}
      {userPlaylists.length > 0 && onAddToPlaylist && (
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
            className="text-zinc-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-white transition-all duration-200"
            aria-label="More options"
          >
            <MoreHorizontal size={compact ? 14 : 16} />
          </button>

          {menuOpen && (
            <>
              {/* click-outside backdrop */}
              <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-full mt-1 bg-zinc-800/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50 min-w-[180px] border border-white/[0.06] animate-fade-in">
                <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Add to playlist</p>
                {userPlaylists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={e => { e.stopPropagation(); onAddToPlaylist(pl.id, song.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Duration */}
      <span className={`flex-shrink-0 tabular-nums text-zinc-600 ${compact ? 'text-[10px]' : 'text-xs'} w-10 text-right`}>
        {formatDuration(song.duration)}
      </span>
    </div>
  );
};

export default SongItem;
