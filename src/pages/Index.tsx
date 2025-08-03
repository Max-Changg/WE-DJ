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
        // `http://localhost:8000/api/search_song?query=${encodeURIComponent(
        //   query
        // )}+official+audio`,
        `https://we-dj-proxy-production.up.railway.app/api/search_song?query=${encodeURIComponent(
          query
        )}+official+audio`,
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
        // `http://localhost:8000/api/get_song?uuid=${data.folder}`,
        `https://we-dj-proxy-production.up.railway.app/api/get_song?uuid=${data.folder}`,
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

      console.log("Got audio response");
      const thumbnailUrl = audioResponse.headers.get("X-Thumbnail-Url");
      const songTitle = audioResponse.headers.get("X-Song-Title");
      console.log("Headers:", { thumbnailUrl, songTitle });

      const blob = await audioResponse.blob();
      console.log("Got blob, size:", blob.size);
      const url = URL.createObjectURL(blob);

      // Use the decoded song names if no headers
      const title =
        songTitle ||
        decodeURIComponent(data["current-song"]).replace(".mp3", "");

      setThumbnailUrl(thumbnailUrl);
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
