import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TransitionResults } from "@/components/TransitionResults";
import { SelectedSong } from "@/components/SelectedSong";

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
    console.log("Song selected:", song);
    setSelectedSong(song);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Always show the hero section */}
      <HeroSection onSongSelect={handleSongSelect} />

      {/* Show selected song and transition results when a song is selected */}
      {selectedSong && (
        <div className="flex-1 px-6 py-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="text-2xl grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Selected Song */}
              <div className="flex flex-col items-start">
                <SelectedSong song={selectedSong} />
              </div>

              {/* Right side - Transition Results */}
              <div className="flex flex-col items-start">
                <TransitionResults sourceSong={selectedSong} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
