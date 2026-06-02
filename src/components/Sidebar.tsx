import React, { useRef, useState } from 'react';
import { Heart, Plus, Upload, Music, ListMusic, X, Trash2 } from 'lucide-react';
import type { Playlist, Song } from '../../types';

interface SidebarProps {
  songs: Song[];
  playlists: Playlist[];
  currentView: string;
  onViewChange: (view: string) => void;
  onUpload: (files: FileList) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  likedSongsId: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  songs, playlists, currentView, onViewChange, onUpload,
  onCreatePlaylist, onDeletePlaylist, likedSongsId, isOpen, onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleUpload = () => fileInputRef.current?.click();
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) { onUpload(e.target.files); e.target.value = ''; }
  };
  const handleCreate = () => {
    if (newName.trim()) { onCreatePlaylist(newName.trim()); setNewName(''); setIsCreating(false); }
  };

  const liked = playlists.find(p => p.id === likedSongsId);
  const userPl = playlists.filter(p => p.id !== likedSongsId);

  const nav = (view: string) => { onViewChange(view); onClose(); };

  /* ── Shared content ── */
  const content = (
    <div className="h-full flex flex-col bg-[#050505]/95 backdrop-blur-3xl border-r border-white/[0.03]">
      {/* Logo + close */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <Music size={16} className="text-black" />
          </div>
          <span className="text-base font-extrabold text-white tracking-tight">WebP3</span>
        </div>
        <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-white p-1 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Upload */}
      <div className="px-5 mb-8 mt-2">
        <button
          id="upload-songs-btn"
          onClick={handleUpload}
          className="w-full flex items-center justify-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          <Upload size={16} className="text-emerald-400" />
          Upload MP3
        </button>
        <input ref={fileInputRef} type="file" accept=".mp3,audio/mpeg" multiple onChange={handleFiles} className="hidden" />
      </div>

      {/* Navigation */}
      <nav className="px-4 flex-1 overflow-y-auto scrollbar-thin" aria-label="Library navigation">

        {/* Collection Section */}
        <div className="mb-8">
          <p className="px-2 text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-3">Your Collection</p>
          <div className="space-y-1">
            <button
              onClick={() => nav('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === 'all' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Music size={18} className={currentView === 'all' ? 'text-emerald-400' : 'text-zinc-500'} />
              <span className="truncate">All Songs</span>
              <span className="ml-auto text-[11px] font-mono text-zinc-600">{songs.length}</span>
            </button>

            <button
              onClick={() => nav(likedSongsId)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === likedSongsId ? 'bg-white/[0.08] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <Heart size={18} className={currentView === likedSongsId ? 'text-emerald-400 fill-emerald-400/20' : 'text-zinc-500'} />
              <span className="truncate">Liked Songs</span>
              <span className="ml-auto text-[11px] font-mono text-zinc-600">{liked?.songIds.length ?? 0}</span>
            </button>
          </div>
        </div>

        {/* Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Playlists</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-zinc-500 hover:text-emerald-400 transition-colors"
              aria-label="Create playlist"
            >
              <Plus size={16} />
            </button>
          </div>

          {isCreating && (
            <div className="px-2 mb-3 animate-fade-in">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setIsCreating(false); setNewName(''); } }}
                  placeholder="Name..."
                  autoFocus
                  className="flex-1 min-w-0 bg-[#111] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                />
                <button onClick={handleCreate} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-1 transition-colors">
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {userPl.map(pl => (
              <div
                key={pl.id}
                onClick={() => nav(pl.id)}
                className={`group/pl flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${currentView === pl.id ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <ListMusic size={18} className={currentView === pl.id ? 'text-emerald-400' : 'text-zinc-600'} />
                <span className="truncate flex-1">{pl.name}</span>
                <span className="text-[11px] font-mono text-zinc-600 group-hover/pl:hidden">{pl.songIds.length}</span>
                <button
                  onClick={e => { e.stopPropagation(); onDeletePlaylist(pl.id); }}
                  className="hidden group-hover/pl:block text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label={`Delete ${pl.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {userPl.length === 0 && !isCreating && (
              <p className="text-xs text-zinc-600 px-3 py-2">No custom playlists</p>
            )}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 lg:w-[280px] flex-shrink-0 z-30" id="sidebar-desktop">
        {content}
      </aside>

      {isOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-backdrop" onClick={onClose} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 animate-slide-in shadow-2xl shadow-black" id="sidebar-mobile">
            {content}
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;