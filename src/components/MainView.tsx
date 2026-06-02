import React from 'react';
import { Menu, Upload, Music, Clock } from 'lucide-react';
import SearchBar from './SearchBar';
import SongItem from './SongItem';
import type { Song, Playlist } from '../../types';

interface MainViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  onMenuOpen: () => void;
  onUpload: (files: FileList) => void;
  getPlaylistSongs: (id: string) => Song[];
  searchSongs: (q: string) => Song[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
}

const MainView: React.FC<MainViewProps> = ({
  songs, playlists, currentView, searchQuery, onSearchChange,
  currentSong, isPlaying, onPlaySong, onToggleLike, isLiked,
  onMenuOpen, onUpload, getPlaylistSongs, searchSongs,
  onAddToPlaylist,
}) => {
  /* ── Determine what to show ── */
  let displaySongs: Song[];
  let viewTitle: string;
  let viewSub: string;

  if (searchQuery.trim()) {
    displaySongs = searchSongs(searchQuery);
    viewTitle = `Search: "${searchQuery}"`;
    viewSub = `${displaySongs.length} result${displaySongs.length !== 1 ? 's' : ''}`;
  } else if (currentView === 'all') {
    displaySongs = songs;
    viewTitle = 'All Songs';
    viewSub = `${songs.length} song${songs.length !== 1 ? 's' : ''} in your library`;
  } else {
    const pl = playlists.find(p => p.id === currentView);
    displaySongs = getPlaylistSongs(currentView);
    viewTitle = pl?.name ?? 'Playlist';
    viewSub = `${displaySongs.length} song${displaySongs.length !== 1 ? 's' : ''}`;
  }

  /* ── Drag-n-drop ── */
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
  };

  return (
    <main
      className="flex-1 relative overflow-y-auto bg-gradient-to-b from-[#0f0f0f] to-[#090909] scrollbar-thin"
      onDragOver={onDragOver}
      onDrop={onDrop}
      id="main-view"
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center gap-4 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/[0.03]">
        <button
          id="mobile-menu-btn"
          onClick={onMenuOpen}
          className="md:hidden text-zinc-500 hover:text-white transition-colors p-1.5 -ml-1"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="flex-1 flex justify-center">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
      </header>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 lg:px-8 py-5 md:py-6">
        {songs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.04]">
              <Music size={32} className="text-zinc-700" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Your library is empty</h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-xs leading-relaxed">
              Upload some MP3 files to get started. You can also drag and drop files anywhere on this page.
            </p>
            <label
              id="empty-state-upload-btn"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 px-6 rounded-full transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-emerald-500/20"
            >
              <Upload size={16} />
              Choose Files
              <input
                type="file"
                accept=".mp3,audio/mpeg"
                multiple
                onChange={e => e.target.files && onUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* View header */}
            <div className="mb-5 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{viewTitle}</h1>
              <p className="text-sm text-zinc-600">{viewSub}</p>
            </div>

            {/* Table header */}
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] md:text-[11px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-white/[0.04] mb-1">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="w-6" />
              <Clock size={13} className="w-10 text-right text-zinc-700" />
            </div>

            {/* Song list */}
            <div className="space-y-px">
              {displaySongs.map((song, i) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={i}
                  isPlaying={isPlaying}
                  isCurrentSong={currentSong?.id === song.id}
                  isLiked={isLiked(song.id)}
                  onPlay={onPlaySong}
                  onToggleLike={onToggleLike}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                />
              ))}
            </div>

            {/* No results */}
            {searchQuery && displaySongs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-zinc-600 text-sm">No songs match "<span className="text-zinc-400">{searchQuery}</span>"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default MainView;