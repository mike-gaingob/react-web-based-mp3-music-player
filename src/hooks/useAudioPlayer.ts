import { useState, useRef, useCallback, useEffect } from 'react';
import type { Song, RepeatMode } from '../../types';

export function useAudioPlayer(songs: Song[]) {
  /* ── Refs ── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) audioRef.current = new Audio();

  const songsRef = useRef(songs);
  const currentSongRef = useRef<Song | null>(null);
  const isShuffleRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>('off');
  const shuffleQueueRef = useRef<number[]>([]);

  /* ── State ── */
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  /* keep refs in sync */
  songsRef.current = songs;
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { 
    isShuffleRef.current = isShuffle; 
    if (isShuffle) {
      // Create a shuffle queue when turned on
      const len = songsRef.current.length;
      const q = Array.from({ length: len }, (_, i) => i);
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      shuffleQueueRef.current = q;
    }
  }, [isShuffle, songs]); // re-shuffle if songs change while shuffle is on
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  /* ── Internal: play a new song ── */
  const playNewSong = useCallback((song: Song) => {
    const audio = audioRef.current!;
    audio.src = song.objectUrl;
    audio.play().catch(() => {});
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  /* ── Audio element event wiring (runs once) ── */
  useEffect(() => {
    const audio = audioRef.current!;
    audio.volume = 0.7;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onMetadata = () => setDuration(audio.duration);

    const onEnded = () => {
      const repeat = repeatModeRef.current;
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const list = songsRef.current;
      const cur = currentSongRef.current;
      if (!cur || list.length === 0) { setIsPlaying(false); return; }

      const idx = list.findIndex(s => s.id === cur.id);
      let next: number;

      if (isShuffleRef.current && shuffleQueueRef.current.length > 0) {
        const q = shuffleQueueRef.current;
        let qIdx = q.indexOf(idx);
        if (qIdx === -1) qIdx = 0;
        
        if (qIdx + 1 >= q.length) {
          if (repeat === 'all') next = q[0];
          else { setIsPlaying(false); return; }
        } else {
          next = q[qIdx + 1];
        }
      } else {
        next = idx + 1;
        if (next >= list.length) {
          if (repeat === 'all') { next = 0; }
          else { setIsPlaying(false); return; }
        }
      }

      const nextSong = list[next];
      audio.src = nextSong.objectUrl;
      audio.play().catch(() => {});
      setCurrentSong(nextSong);
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── If the current song was removed from the library, stop playback ── */
  useEffect(() => {
    if (currentSong && songs.length > 0 && !songs.some(s => s.id === currentSong.id)) {
      const audio = audioRef.current!;
      audio.pause();
      audio.src = '';
      setCurrentSong(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [songs, currentSong]);

  /* ── Public API ── */
  const playSong = useCallback((song: Song) => {
    const audio = audioRef.current!;
    if (currentSongRef.current?.id === song.id) {
      if (audio.paused) { audio.play().catch(() => {}); setIsPlaying(true); }
      else              { audio.pause(); setIsPlaying(false); }
      return;
    }
    playNewSong(song);
  }, [playNewSong]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current!;
    if (!currentSongRef.current) return;
    if (audio.paused) { audio.play().catch(() => {}); setIsPlaying(true); }
    else              { audio.pause(); setIsPlaying(false); }
  }, []);

  const seekTo = useCallback((time: number) => {
    audioRef.current!.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    audioRef.current!.volume = v;
    setVolumeState(v);
  }, []);

  const skipNext = useCallback(() => {
    const list = songsRef.current;
    const cur = currentSongRef.current;
    if (list.length === 0 || !cur) return;
    const idx = list.findIndex(s => s.id === cur.id);
    let next: number;
    if (isShuffleRef.current && shuffleQueueRef.current.length > 0) {
      const q = shuffleQueueRef.current;
      let qIdx = q.indexOf(idx);
      if (qIdx === -1) qIdx = 0;
      next = q[(qIdx + 1) % q.length];
    } else {
      next = (idx + 1) % list.length;
    }
    playNewSong(list[next]);
  }, [playNewSong]);

  const skipPrev = useCallback(() => {
    const list = songsRef.current;
    const cur = currentSongRef.current;
    const audio = audioRef.current!;
    if (list.length === 0 || !cur) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; setCurrentTime(0); return; }
    const idx = list.findIndex(s => s.id === cur.id);
    let prev: number;
    if (isShuffleRef.current && shuffleQueueRef.current.length > 0) {
      const q = shuffleQueueRef.current;
      let qIdx = q.indexOf(idx);
      if (qIdx === -1) qIdx = 0;
      prev = q[(qIdx - 1 + q.length) % q.length];
    } else {
      prev = (idx - 1 + list.length) % list.length;
    }
    playNewSong(list[prev]);
  }, [playNewSong]);

  const toggleShuffle = useCallback(() => setIsShuffle(p => !p), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(p => (p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'));
  }, []);

  return {
    currentSong, isPlaying, currentTime, duration, volume,
    isShuffle, repeatMode,
    playSong, togglePlayPause, seekTo, setVolume,
    skipNext, skipPrev, toggleShuffle, cycleRepeat,
  };
}
