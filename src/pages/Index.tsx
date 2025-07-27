import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TransitionResults } from "@/components/TransitionResults";

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
}

const Index = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  return (
    <div className="min-h-screen bg-background">
      {!selectedSong ? (
        <HeroSection onSongSelect={handleSongSelect} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="mb-8">
            <button
              onClick={() => setSelectedSong(null)}
              className="text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-2"
            >
              ← Back to search
            </button>
          </div>
          <TransitionResults sourceSong={selectedSong} />
        </div>
      )}
    </div>
  );
};

export default Index;
