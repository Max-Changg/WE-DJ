import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
}

interface SearchBarProps {
  onSongSelect: (song: Song) => void;
  className?: string;
}

// Function to search and download song using the backend API
const searchAndDownloadSong = async (query: string): Promise<Song | null> => {
  if (!query.trim()) return null;

  try {
    console.log("Searching for song:", query);
    const response = await fetch(
      `http://localhost:8000/api/search_song?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const songName = await response.text();
    console.log("Downloaded song:", songName);

    // Parse the song name to extract title and artist
    // Assuming format: "Title - Artist.mp3" or just "Title.mp3"
    const cleanName = songName.replace(".mp3", "");
    const parts = cleanName.split(" - ");

    const title = parts[0] || cleanName;
    const artist = parts[1] || "Unknown Artist";

    return {
      id: `backend-${Date.now()}`,
      title: title,
      artist: artist,
      bpm: undefined,
      key: undefined,
    };
  } catch (error) {
    console.error("Error searching/downloading song:", error);
    return null;
  }
};

export const SearchBar = ({ onSongSelect, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (query.trim() && !isLoading) {
      setIsLoading(true);
      const song = await searchAndDownloadSong(query);
      setIsLoading(false);

      if (song) {
        onSongSelect(song);
      }
    }
  };

  const handleArrowClick = () => {
    handleSearch();
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            isLoading
              ? "Searching and downloading..."
              : "Enter song title and artist (e.g., 'Bohemian Rhapsody Queen')"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="pl-12 pr-16 py-6 text-lg bg-card border-border focus:border-primary focus:ring-primary focus:shadow-glow-primary transition-all duration-300"
        />
        <Button
          size="sm"
          disabled={isLoading || !query.trim()}
          onClick={handleArrowClick}
          className="absolute right-2 h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 hover:shadow-glow-primary"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
