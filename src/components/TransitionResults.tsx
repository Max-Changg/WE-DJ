import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
}

interface TransitionSong extends Song {
  matchScore: number;
  matchReasons: string[];
}

interface TransitionResultsProps {
  sourceSong: Song;
  className?: string;
}

// Mock transition algorithm - in a real app this would be more sophisticated
const generateTransitions = (sourceSong: Song): TransitionSong[] => {
  const allSongs: Song[] = [
    { id: "t1", title: "Strobe", artist: "Deadmau5", bpm: 128, key: "F#m" },
    { id: "t2", title: "Language", artist: "Porter Robinson", bpm: 128, key: "G" },
    { id: "t3", title: "Ghosts 'n' Stuff", artist: "Deadmau5", bpm: 128, key: "F#m" },
    { id: "t4", title: "Scary Monsters and Nice Sprites", artist: "Skrillex", bpm: 140, key: "G#m" },
    { id: "t5", title: "Bangarang", artist: "Skrillex", bpm: 110, key: "F#m" },
    { id: "t6", title: "Silhouettes", artist: "Avicii", bpm: 128, key: "C#m" },
    { id: "t7", title: "Don't You Worry Child", artist: "Swedish House Mafia", bpm: 129, key: "Bb" },
    { id: "t8", title: "Save The World", artist: "Swedish House Mafia", bpm: 126, key: "F#m" },
  ];

  return allSongs.map(song => {
    const matchReasons: string[] = [];
    let matchScore = 0;

    // BPM matching
    if (sourceSong.bpm && song.bpm) {
      const bpmDiff = Math.abs(sourceSong.bpm - song.bpm);
      if (bpmDiff <= 2) {
        matchReasons.push("Perfect BPM match");
        matchScore += 40;
      } else if (bpmDiff <= 5) {
        matchReasons.push("Close BPM");
        matchScore += 25;
      } else if (bpmDiff <= 10) {
        matchReasons.push("Compatible BPM");
        matchScore += 15;
      }
    }

    // Key matching
    if (sourceSong.key && song.key) {
      if (sourceSong.key === song.key) {
        matchReasons.push("Same key");
        matchScore += 30;
      } else {
        // Simple harmonic matching (this would be more complex in reality)
        const harmonicKeys = {
          "F#m": ["A", "C#m", "D"],
          "C#m": ["E", "F#m", "A"],
          "G": ["Em", "C", "D"],
        };
        if (harmonicKeys[sourceSong.key as keyof typeof harmonicKeys]?.includes(song.key)) {
          matchReasons.push("Harmonic match");
          matchScore += 25;
        }
      }
    }

    // Artist similarity (simple check)
    if (sourceSong.artist === song.artist) {
      matchReasons.push("Same artist");
      matchScore += 20;
    }

    // Add some randomness for variety
    matchScore += Math.floor(Math.random() * 15);

    return {
      ...song,
      matchScore,
      matchReasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

export const TransitionResults = ({ sourceSong, className }: TransitionResultsProps) => {
  const transitions = generateTransitions(sourceSong);

  return (
    <div className={cn("w-full max-w-4xl space-y-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Perfect transitions from
        </h2>
        <div className="inline-flex items-center gap-2 bg-gradient-card px-4 py-2 rounded-lg border border-border">
          <Music className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">
            {sourceSong.title} - {sourceSong.artist}
          </span>
          {sourceSong.bpm && (
            <Badge variant="outline" className="ml-2">
              {sourceSong.bpm} BPM
            </Badge>
          )}
          {sourceSong.key && (
            <Badge variant="outline" className="ml-1">
              {sourceSong.key}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {transitions.slice(0, 6).map((song, index) => (
          <Card 
            key={song.id} 
            className="p-6 bg-gradient-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow-primary/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-lg">#{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-muted-foreground">{song.artist}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {song.matchReasons.map((reason, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex gap-2 mb-1">
                    {song.bpm && (
                      <Badge variant="outline">{song.bpm} BPM</Badge>
                    )}
                    {song.key && (
                      <Badge variant="outline">{song.key}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {song.matchScore}% match
                  </div>
                </div>
                
                <button className="flex items-center justify-center w-10 h-10 bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200 hover:shadow-glow-primary">
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};