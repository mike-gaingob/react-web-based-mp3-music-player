export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file: File;
  objectUrl: string;
  addedAt: number;
  imageUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  isDefault?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';
