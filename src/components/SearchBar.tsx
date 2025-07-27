import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

// Function to load songs from the database file
const loadSongsFromDatabase = async (): Promise<Song[]> => {
  try {
    const response = await fetch("/song_list.txt");
    const text = await response.text();

    return text
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line, index) => {
        // Parse the format: "1. Title - Artist"
        const match = line.match(/^\s*(\d+)\.\s*(.+?)\s*-\s*(.+)$/);
        if (match) {
          const [, id, title, artist] = match;
          return {
            id: id.trim(),
            title: title.trim(),
            artist: artist.trim(),
            bpm: undefined, // BPM not available in this format
            key: undefined, // Key not available in this format
          };
        }
        return null;
      })
      .filter((song): song is NonNullable<typeof song> => song !== null);
  } catch (error) {
    console.error("Error loading songs from database:", error);
    return [];
  }
};

export const SearchBar = ({ onSongSelect, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load songs from database on component mount
  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      const loadedSongs = await loadSongsFromDatabase();
      setSongs(loadedSongs);
      setIsLoading(false);
    };

    loadSongs();
  }, []);

  useEffect(() => {
    if (query.length > 0 && !isLoading) {
      // Search based on first letters of song titles and artist names
      const filtered = songs.filter((song) => {
        const titleWords = song.title.toLowerCase().split(" ");
        const artistWords = song.artist.toLowerCase().split(" ");
        const queryWords = query.toLowerCase().split(" ");

        // Check if each query word matches the beginning of any title word OR artist word
        return queryWords.every(
          (queryWord) =>
            titleWords.some((titleWord) => titleWord.startsWith(queryWord)) ||
            artistWords.some((artistWord) => artistWord.startsWith(queryWord))
        );
      });

      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, songs, isLoading]);

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
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSong = (song: Song) => {
    setQuery(`${song.title} - ${song.artist}`);
    setShowSuggestions(false);
    onSongSelect(song);
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            isLoading
              ? "Loading songs..."
              : "Search for a song to transition from..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={isLoading}
          className="pl-12 pr-4 py-6 text-lg bg-card border-border focus:border-primary focus:ring-primary focus:shadow-glow-primary transition-all duration-300"
        />
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
