import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AudioPlayer } from "@/components/AudioPlayer";

const Index = () => {
  const [transitionURL, setTransitionURL] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://we-dj-proxy-production.up.railway.app/api/search_song?query=${encodeURIComponent(
          query
        )}+official+audio`,
        {
          method: "GET",
          mode: "no-cors", // Add this line
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const thumbnailUrl = response.headers.get("X-Thumbnail-Url");
      const songTitle = response.headers.get("X-Song-Title");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setThumbnailUrl(thumbnailUrl);
      setTitle(songTitle);
      setTransitionURL(url);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero section with search */}
      <HeroSection onSearch={handleSearch} />

      {/* Audio player */}
      <div className="absolute inset-x-0 bottom-1 px-6 z-50">
        {transitionURL && (
          <div className="w-full max-w-2xl mx-auto">
            <AudioPlayer
              src={transitionURL}
              thumbnailUrl={thumbnailUrl}
              title={title}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
