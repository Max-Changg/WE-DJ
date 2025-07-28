import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
}

interface SelectedSongProps {
  song: Song;
  className?: string;
}

export const SelectedSong = ({ song, className }: SelectedSongProps) => {
  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <h3 className="font-semibold text-foreground mb-3">
        Selected Song
      </h3>
      <div className="inline-flex items-center gap-2 bg-gradient-card px-4 py-3 rounded-lg border border-border">
        <Music className="h-5 w-5 text-primary" />
        <span className="text-lg font-medium text-foreground">
          {song.title} - {song.artist}
        </span>
        {song.bpm && (
          <Badge variant="outline" className="ml-2">
            {song.bpm} BPM
          </Badge>
        )}
        {song.key && (
          <Badge variant="outline" className="ml-1">
            {song.key}
          </Badge>
        )}
      </div>
    </div>
  );
};
