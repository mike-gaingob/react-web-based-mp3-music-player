import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import PlayerControls from './components/PlayControls';
import NowPlayingScreen from './components/NowPlayingScreen';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useMusicLibrary } from './hooks/useMusicLibrary';

function App() {
  const library = useMusicLibrary();
  const player = useAudioPlayer(library.songs);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNowPlayingScreenOpen, setIsNowPlayingScreenOpen] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSongLiked = player.currentSong
    ? library.isLiked(player.currentSong.id)
    : false;

  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden font-sans">
      {/* Top: Sidebar + Main */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          songs={library.songs}
          playlists={library.playlists}
          currentView={currentView}
          onViewChange={setCurrentView}
          onUpload={files => library.addSongs(files)}
          onCreatePlaylist={library.createPlaylist}
          onDeletePlaylist={library.deletePlaylist}
          likedSongsId={library.LIKED_SONGS_ID}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <MainView
          songs={library.songs}
          playlists={library.playlists}
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentSong={player.currentSong}
          isPlaying={player.isPlaying}
          onPlaySong={player.playSong}
          onToggleLike={library.toggleLike}
          isLiked={library.isLiked}
          onMenuOpen={() => setSidebarOpen(true)}
          onUpload={files => library.addSongs(files)}
          getPlaylistSongs={library.getPlaylistSongs}
          searchSongs={library.searchSongs}
          onAddToPlaylist={(plId, songId) => library.addToPlaylist(plId, [songId])}
        />
      </div>

      {/* Bottom: Player */}
      <PlayerControls
        currentSong={player.currentSong}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isShuffle={player.isShuffle}
        repeatMode={player.repeatMode}
        isLiked={currentSongLiked}
        onTogglePlayPause={player.togglePlayPause}
        onSkipNext={player.skipNext}
        onSkipPrev={player.skipPrev}
        onSeek={player.seekTo}
        onVolumeChange={player.setVolume}
        onToggleShuffle={player.toggleShuffle}
        onCycleRepeat={player.cycleRepeat}
        onToggleLike={() => player.currentSong && library.toggleLike(player.currentSong.id)}
        onExpand={() => { if (player.currentSong) setIsNowPlayingScreenOpen(true); }}
      />

      {/* Full Screen Overlay */}
      {isNowPlayingScreenOpen && player.currentSong && (
        <NowPlayingScreen
          song={player.currentSong}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          isShuffle={player.isShuffle}
          repeatMode={player.repeatMode}
          isLiked={currentSongLiked}
          onTogglePlayPause={player.togglePlayPause}
          onSkipNext={player.skipNext}
          onSkipPrev={player.skipPrev}
          onSeek={player.seekTo}
          onToggleShuffle={player.toggleShuffle}
          onCycleRepeat={player.cycleRepeat}
          onToggleLike={() => library.toggleLike(player.currentSong!.id)}
          onClose={() => setIsNowPlayingScreenOpen(false)}
        />
      )}
    </div>
  );
}

export default App;