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
  onSongSelect: (song: string) => void;
  className?: string;
  setTransitionURL: (url: string | null) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Function to search and download song using the backend API
const searchAndDownloadSong = async (query: string): Promise<string | null> => {
  if (!query.trim()) return null;

  try {
    const response = await fetch(
      `http://76.71.171.219:56134/api/search_song?query=${query}+official+audio`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch audio");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    console.log(blob.size);
    return url;
  } catch (error) {
    console.error("Error searching/downloading song:", error);
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "Backend server is not running. Please start the server at http://localhost:8000"
      );
    }
    return null;
  }
};

export const SearchBar = ({
  onSongSelect,
  className,
  setTransitionURL,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = async () => {
    setTransitionURL(null);
    if (query.trim() && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const song = await searchAndDownloadSong(query);
        setTransitionURL(song);
        onSongSelect(query);
      } catch (error) {
        if (
          error instanceof TypeError &&
          error.message.includes("Failed to fetch")
        ) {
          setError("Backend server is not running. Please start the server.");
        } else {
          setError("An error occurred while searching for the song.");
        }
      }
      setIsLoading(false);
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
          className={cn(
            "pl-12 pr-16 py-6 text-lg bg-card border-border focus:border-primary focus:ring-primary focus:shadow-glow-primary transition-all duration-300",
            error ? "border-red-500" : ""
          )}
        />
        {error && (
          <div className="absolute -bottom-8 left-0 text-sm text-red-500">
            {error}
          </div>
        )}
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
