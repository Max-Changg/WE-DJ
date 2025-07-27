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

// Mock song database - in a real app this would come from a music API
const mockSongs: Song[] = [
  { id: "1", title: "Levels", artist: "Avicii", bpm: 126, key: "C#m" },
  { id: "2", title: "Titanium", artist: "David Guetta ft. Sia", bpm: 126, key: "F#" },
  { id: "3", title: "Animals", artist: "Martin Garrix", bpm: 128, key: "F#m" },
  { id: "4", title: "Clarity", artist: "Zedd ft. Foxes", bpm: 128, key: "G" },
  { id: "5", title: "Wake Me Up", artist: "Avicii", bpm: 124, key: "Bm" },
  { id: "6", title: "Lean On", artist: "Major Lazer & DJ Snake", bpm: 98, key: "F#m" },
  { id: "7", title: "Waiting For Love", artist: "Avicii", bpm: 128, key: "F#m" },
  { id: "8", title: "Firestone", artist: "Kygo ft. Conrad Sewell", bpm: 102, key: "C#m" },
  { id: "9", title: "Midnight City", artist: "M83", bpm: 104, key: "Bb" },
  { id: "10", title: "One More Time", artist: "Daft Punk", bpm: 123, key: "F#m" },
];

export const SearchBar = ({ onSongSelect, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
      setSelectedIndex(-1);
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
          placeholder="Search for a song to transition from..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
                  <div className="font-medium text-foreground">{song.title}</div>
                  <div className="text-sm text-muted-foreground">{song.artist}</div>
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