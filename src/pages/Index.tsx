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

      const response = await fetch(
        // For local testing:
        // `http://localhost:8000/api/search_song?query=${encodeURIComponent(
        //   query
        // )}+official+audio`,
        // For production:
        `https://we-dj-proxy-production.up.railway.app/api/search_song?query=${encodeURIComponent(
          query
        )}+official+audio`,
        {
          method: "GET",
          headers: {
            Accept: "audio/mpeg, application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const contentType = response.headers.get("Content-Type");
      console.log("Content type:", contentType);

      // If it's JSON, we need to make a second request
      if (contentType?.includes("application/json")) {
        const data = (await response.json()) as SearchResponse;
        console.log("Got UUID:", data.folder);

        const audioResponse = await fetch(
          // For local testing:
          // `http://localhost:8000/api/get_song?uuid=${data.folder}`,
          // For production:
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

        const blob = await audioResponse.blob();
        const url = URL.createObjectURL(blob);
        const title = decodeURIComponent(data["current-song"]).replace(
          ".mp3",
          ""
        );

        setThumbnailUrl(null);
        setTitle(title);
        setTransitionURL(url);
      }
      // If it's MP3, we can use it directly
      else if (contentType?.includes("audio/mpeg")) {
        console.log("Got direct audio response");
        const thumbnailUrl = response.headers.get("X-Thumbnail-Url");
        const songTitle = response.headers.get("X-Song-Title");
        console.log("Headers:", { thumbnailUrl, songTitle });

        const blob = await response.blob();
        console.log("Got blob, size:", blob.size);
        const url = URL.createObjectURL(blob);

        setThumbnailUrl(thumbnailUrl);
        setTitle(songTitle);
        setTransitionURL(url);
      } else {
        throw new Error(`Unexpected content type: ${contentType}`);
      }
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
