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

// Function to search songs using the music autocomplete API
const searchSongsFromAPI = async (query: string): Promise<Song[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://musicautocomplete.deno.dev/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.type);
      return [];
    }

    console.log("API response:", data);
    // Convert API results to Song format
    const songs = data.results.map((title: string, index: number) => ({
      id: `api-${index}`,
      title: title,
      artist: "Unknown Artist", // API doesn't provide artist info
      bpm: undefined,
      key: undefined,
    }));
    console.log("Converted songs:", songs);
    return songs;
  } catch (error) {
    console.error("Error fetching from music autocomplete API:", error);
    return [];
  }
};

export const SearchBar = ({ onSongSelect, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const searchSongs = async () => {
        setIsLoading(true);
        const results = await searchSongsFromAPI(query);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
        setSelectedIndex(-1);
        setIsLoading(false);
      };

      // Debounce the API call
      const timeoutId = setTimeout(searchSongs, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSong(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          // If no suggestion is selected but there are suggestions, select the first one
          selectSong(suggestions[0]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSong = (song: Song) => {
    console.log("selectSong called with:", song);
    setQuery(`${song.title} - ${song.artist}`);
    setShowSuggestions(false);
    onSongSelect(song);
  };

  const handleArrowClick = () => {
    if (query.trim() && !isLoading) {
      // If there are already suggestions, select the first one
      if (suggestions.length > 0) {
        selectSong(suggestions[0]);
        return;
      }

      // Otherwise, trigger search manually
      const searchSongs = async () => {
        setIsLoading(true);
        const results = await searchSongsFromAPI(query);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
        setSelectedIndex(0); // Select the first result
        setIsLoading(false);

        // Auto-select the first result after a brief delay
        setTimeout(() => {
          if (results.length > 0) {
            selectSong(results[0]);
          }
        }, 100);
      };
      searchSongs();
    }
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
              ? "Searching..."
              : "Search for a song to transition from..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {suggestions.map((song, index) => (
            <div
              key={song.id}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-border last:border-b-0",
                index === selectedIndex
                  ? "bg-primary/10 border-primary/20"
                  : "hover:bg-muted/50"
              )}
              onClick={() => selectSong(song)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-foreground">
                    {song.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {song.artist}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  {song.bpm && <span>{song.bpm} BPM</span>}
                  {song.key && <span>{song.key}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
