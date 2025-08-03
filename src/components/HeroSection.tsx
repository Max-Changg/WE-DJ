import { SearchBar, TransitionType } from "./SearchBar";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSearch: (query: string, transitionType: TransitionType) => void;
  className?: string;
}

export const HeroSection = ({ onSearch, className }: HeroSectionProps) => {
  return (
    <section
      className={cn(
        "min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden mt-32",
        className
      )}
    >
      {/* Solid background */}
      <div className="absolute inset-0 bg-background" />

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-48 h-28 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-primary/40 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Main heading */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight mb-6">
            WE-DJ
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the perfect transitions for your DJ sets.
            <br />
            <span className="text-accent font-medium">
              Find songs that flow seamlessly together.
            </span>
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-2xl mb-2">🎵</div>
            <h3 className="font-semibold text-foreground mb-2">BPM Matching</h3>
            <p className="text-sm text-muted-foreground">
              Find songs with compatible tempos for smooth transitions
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-2xl mb-2">🎹</div>
            <h3 className="font-semibold text-foreground mb-2">
              Harmonic Mixing
            </h3>
            <p className="text-sm text-muted-foreground">
              Discover tracks in compatible keys for seamless blends
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-foreground mb-2">Energy Flow</h3>
            <p className="text-sm text-muted-foreground">
              Maintain the perfect energy progression in your sets
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full flex flex-col items-center justify-center">
          <SearchBar onSearch={onSearch} className="w-full max-w-2xl mx-auto" />
          {/* Call to action */}
        </div>
      </div>
    </section>
  );
};
