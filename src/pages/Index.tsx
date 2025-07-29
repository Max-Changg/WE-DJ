import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TransitionResults } from "@/components/TransitionResults";
import { SelectedSong } from "@/components/SelectedSong";
import { ArrowRight } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
}

const Index = () => {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [transitionURL, setTransitionURL] = useState<string | null>(null);

  const handleSongSelect = (song: string) => {
    console.log("Song selected:", song);
    setSelectedSong(song);
  };

  const handleSetTransitionURL = (url: string | null) => {
    setTransitionURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Always show the hero section */}
      <HeroSection
        onSongSelect={handleSongSelect}
        setTransitionURL={handleSetTransitionURL}
      />

      {/* Show selected song and transition results when a song is selected */}
      {selectedSong && (
        <div className="flex-1 px-6 py-8 pb-80 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="text-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
              {/* Left side - Selected Song */}

              {/* Center Arrow */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border border-primary/20">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Right side - Transition Results */}
              <div className="flex flex-col items-start">
                {transitionURL && (
                  <audio controls>
                    <source src={transitionURL} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
