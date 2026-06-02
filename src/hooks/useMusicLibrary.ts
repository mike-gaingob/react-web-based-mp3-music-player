import { useState, useCallback } from 'react';
import type { Song, Playlist } from '../../types';
import { fetchSongMetadata } from '../utils/audioDb';

export const LIKED_SONGS_ID = 'liked-songs';

/* ── helpers ── */
function uid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function parseSongFromFile(file: File): Song {
  const raw = file.name.replace(/\.[^/.]+$/, '');
  let title = raw;
  let artist = 'Unknown Artist';
  if (raw.includes(' - ')) {
    const parts = raw.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }
  return {
    id: uid(),
    title,
    artist,
    duration: 0,
    file,
    objectUrl: URL.createObjectURL(file),
    addedAt: Date.now(),
  };
}

/* ── Hook ── */
export function useMusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: LIKED_SONGS_ID, name: 'Liked Songs', songIds: [], createdAt: Date.now(), isDefault: true },
  ]);

  /* ────── Songs ────── */
  const addSongs = useCallback((files: FileList | File[]) => {
    const incoming: Song[] = [];
    for (const f of Array.from(files)) {
      if (f.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3')) {
        incoming.push(parseSongFromFile(f));
      }
    }
    // resolve durations asynchronously
    incoming.forEach(song => {
      const a = new Audio();
      a.src = song.objectUrl;
      a.addEventListener('loadedmetadata', () => {
        setSongs(prev => prev.map(s => (s.id === song.id ? { ...s, duration: a.duration } : s)));
      });

      // Fetch metadata from TheAudioDB
      fetchSongMetadata(song.artist, song.title).then(meta => {
        const imgUrl = meta.imageUrl;
        if (imgUrl) {
          setSongs(prev => prev.map(s => (s.id === song.id ? { ...s, imageUrl: imgUrl } : s)));
        }
      });
    });
    setSongs(prev => [...prev, ...incoming]);
    return incoming;
  }, []);

  const removeSong = useCallback((songId: string) => {
    setSongs(prev => {
      const s = prev.find(x => x.id === songId);
      if (s) URL.revokeObjectURL(s.objectUrl);
      return prev.filter(x => x.id !== songId);
    });
    setPlaylists(prev => prev.map(p => ({ ...p, songIds: p.songIds.filter(id => id !== songId) })));
  }, []);

  /* ────── Likes ────── */
  const toggleLike = useCallback((songId: string) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id !== LIKED_SONGS_ID) return p;
        const has = p.songIds.includes(songId);
        return { ...p, songIds: has ? p.songIds.filter(id => id !== songId) : [...p.songIds, songId] };
      }),
    );
  }, []);

  const isLiked = useCallback(
    (songId: string): boolean => {
      return playlists.find(p => p.id === LIKED_SONGS_ID)?.songIds.includes(songId) ?? false;
    },
    [playlists],
  );

  /* ────── Playlists ────── */
  const createPlaylist = useCallback((name: string) => {
    const pl: Playlist = { id: uid(), name, songIds: [], createdAt: Date.now() };
    setPlaylists(prev => [...prev, pl]);
    return pl;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, songIds: string[]) => {
    setPlaylists(prev =>
      prev.map(p => {
        if (p.id !== playlistId) return p;
        const existing = new Set(p.songIds);
        return { ...p, songIds: [...p.songIds, ...songIds.filter(id => !existing.has(id))] };
      }),
    );
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists(prev =>
      prev.map(p => (p.id !== playlistId ? p : { ...p, songIds: p.songIds.filter(id => id !== songId) })),
    );
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    if (playlistId === LIKED_SONGS_ID) return;
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  }, []);

  /* ────── Search ────── */
  const searchSongs = useCallback(
    (query: string): Song[] => {
      if (!query.trim()) return songs;
      const q = query.toLowerCase();
      return songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    },
    [songs],
  );

  /* ────── Derived ────── */
  const getPlaylistSongs = useCallback(
    (playlistId: string): Song[] => {
      const pl = playlists.find(p => p.id === playlistId);
      if (!pl) return [];
      return pl.songIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => !!s);
    },
    [playlists, songs],
  );

  return {
    songs,
    playlists,
    addSongs,
    removeSong,
    toggleLike,
    isLiked,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    searchSongs,
    getPlaylistSongs,
    LIKED_SONGS_ID,
  };
}
