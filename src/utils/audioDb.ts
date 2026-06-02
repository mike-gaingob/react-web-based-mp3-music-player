export async function fetchSongMetadata(artist: string, title: string): Promise<{ imageUrl: string | null }> {
  try {
    // Attempt 1: Search by track and artist
    const trackUrl = `https://www.theaudiodb.com/api/v1/json/2/searchtrack.php?s=${encodeURIComponent(artist)}&t=${encodeURIComponent(title)}`;
    const trackRes = await fetch(trackUrl);
    if (trackRes.ok) {
      const trackData = await trackRes.json();
      if (trackData.track && trackData.track.length > 0) {
        const t = trackData.track[0];
        const img = t.strTrackThumb || t.strTrack3DCase || null;
        if (img) return { imageUrl: img };
      }
    }

    // Attempt 2: Search by artist and get fanart/thumb
    const artistUrl = `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(artist)}`;
    const artistRes = await fetch(artistUrl);
    if (artistRes.ok) {
      const artistData = await artistRes.json();
      if (artistData.artists && artistData.artists.length > 0) {
        const a = artistData.artists[0];
        const img = a.strArtistThumb || a.strArtistFanart || null;
        if (img) return { imageUrl: img };
      }
    }

    return { imageUrl: null };
  } catch (err) {
    console.error('Failed to fetch from TheAudioDB:', err);
    return { imageUrl: null };
  }
}
