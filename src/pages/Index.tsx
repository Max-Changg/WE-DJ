import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AudioPlayer } from "@/components/AudioPlayer";

interface SearchResponse {
  folder: string;
  "current-song": string;
  "transition-song": string;
}

const Index = () => {
  const [transitionURL, setTransitionURL] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    try {
      console.log("Starting search for:", query);

      // First get the UUID
      const searchResponse = await fetch(
        `http://localhost:8000/api/search_song?query=${encodeURIComponent(
          query
        )}+official+audio`,
        // For production:
        // `https://we-dj-proxy-production.up.railway.app/api/search_song?query=${encodeURIComponent(
        //   query
        // )}+official+audio`,
        {
          method: "GET",
        }
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to get song UUID");
      }

      const data = (await searchResponse.json()) as SearchResponse;
      console.log("Got UUID:", data.folder);

      // Then get the actual audio file
      const audioResponse = await fetch(
        `http://localhost:8000/api/get_song?uuid=${data.folder}`,
        // For production:
        // `https://we-dj-proxy-production.up.railway.app/api/get_song?uuid=${data.folder}`,
        {
          method: "GET",
          headers: {
            Accept: "audio/mpeg",
          },
        }
      );

      if (!audioResponse.ok) {
        throw new Error("Failed to fetch audio");
      }

      const blob = await audioResponse.blob();
      console.log("Got audio blob, size:", blob.size);
      const url = URL.createObjectURL(blob);

      // Use the song name from the JSON response
      const title = decodeURIComponent(data["current-song"]).replace(
        ".mp3",
        ""
      );

      setThumbnailUrl(null); // No thumbnail in current backend response
      setTitle(title);
      setTransitionURL(url);
    } catch (error) {
      console.error("Search error:", error);
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
