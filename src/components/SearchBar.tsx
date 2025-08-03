import { useState, useRef } from "react";
import { Search, ArrowRight, Loader2, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TransitionType =
  | "scratch"
  | "crossfade"
  | "crazy_crazy_scratch"
  | "vocals_crossover";

export interface SearchBarProps {
  onSearch: (query: string, transitionType: TransitionType) => void;
  className?: string;
}

export const SearchBar = ({ onSearch, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transitionType, setTransitionType] =
    useState<TransitionType>("scratch");
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
      try {
        console.log("Performing search with transition type:", transitionType);
        await onSearch(query, transitionType);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter song title and artist (e.g., 'Bohemian Rhapsody Queen')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="pl-12 pr-16 py-6 text-lg bg-card border-border focus:border-primary focus:ring-primary focus:shadow-glow-primary transition-all duration-300"
        />
        <div className="absolute right-2 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0"
                disabled={isLoading}
              >
                <Music className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  console.log("Changing transition type to: scratch");
                  setTransitionType("scratch");
                }}
              >
                Scratch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Changing transition type to: crossfade");
                  setTransitionType("crossfade");
                }}
              >
                Crossfade
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log(
                    "Changing transition type to: crazy_crazy_scratch"
                  );
                  setTransitionType("crazy_crazy_scratch");
                }}
              >
                Crazy Scratch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Changing transition type to: vocals_crossover");
                  setTransitionType("vocals_crossover");
                }}
              >
                Vocals Crossover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            disabled={isLoading || !query.trim()}
            onClick={handleSearch}
            className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 hover:shadow-glow-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
