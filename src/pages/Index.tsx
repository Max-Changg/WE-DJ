import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TransitionDisplay } from "@/components/TransitionDisplay";

interface SearchResponse {
  folder: string;
  "current-song": string;
  "transition-song": string;
}

const Index = () => {
  const [transitionURL, setTransitionURL] = useState<string | null>(null);

  const [title, setTitle] = useState<string | null>(null);
  const [transitionData, setTransitionData] = useState<{
    folderUuid: string;
    currentSong: string;
    transitionSong: string;
  } | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [transitionThumbnail, setTransitionThumbnail] = useState<string | null>(
    null
  );

  const pollForThumbnails = async (folderUuid: string) => {
    const maxAttempts = 120; // Maximum number of attempts (2 minutes)
    const interval = 1000; // Check every 1 second
    let attempts = 0;

    const checkThumbnails = async () => {
      try {
        const [currentThumbResponse, transitionThumbResponse] =
          await Promise.all([
            fetch(
              `http://127.0.0.1:8000/api/get_thumbnail?song_uuid=${folderUuid}&thumbnail_type=current`,
              // For production:
              // `https://we-dj-proxy-production.up.railway.app/api/get_thumbnail?song_uuid=${folderUuid}&thumbnail_type=current`
              {
                method: "GET",
              }
            ),
            fetch(
              `http://127.0.0.1:8000/api/get_thumbnail?song_uuid=${folderUuid}&thumbnail_type=transition`,
              // For production:
              // `https://we-dj-proxy-production.up.railway.app/api/get_thumbnail?song_uuid=${folderUuid}&thumbnail_type=transition`
              {
                method: "GET",
              }
            ),
          ]);

        if (currentThumbResponse.ok && transitionThumbResponse.ok) {
          // Thumbnails are ready!
          const currentBlob = await currentThumbResponse.blob();
          const transitionBlob = await transitionThumbResponse.blob();
          setCurrentThumbnail(URL.createObjectURL(currentBlob));
          setTransitionThumbnail(URL.createObjectURL(transitionBlob));
          return true; // Success
        }
      } catch (error) {
        console.error("Error checking thumbnails:", error);
      }
      return false; // Not ready yet
    };

    // Keep checking until thumbnails are ready or max attempts reached
    const poll = async () => {
      const isReady = await checkThumbnails();
      attempts++;

      if (!isReady && attempts < maxAttempts) {
        // Try again after interval
        setTimeout(poll, interval);
      }
    };

    poll(); // Start polling
  };

  const pollForTransition = async (folderUuid: string) => {
    const maxAttempts = 120; // Maximum number of attempts (2 minutes)
    const interval = 1000; // Check every 1 second
    let attempts = 0;

    const checkTransition = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/get_song?song_uuid=${folderUuid}`,
          // For production:
          // `https://we-dj-proxy-production.up.railway.app/api/get_song?song_uuid=${folderUuid}`
          {
            method: "GET",
          }
        );

        if (response.ok) {
          // Transition is ready!
          const blob = await response.blob();
          setTransitionURL(URL.createObjectURL(blob));
          return true; // Success
        }
      } catch (error) {
        console.error("Error checking transition:", error);
      }
      return false; // Not ready yet
    };

    // Keep checking until transition is ready or max attempts reached
    const poll = async () => {
      const isReady = await checkTransition();
      attempts++;

      if (!isReady && attempts < maxAttempts) {
        // Try again after interval
        setTimeout(poll, interval);
      }
    };

    poll(); // Start polling
  };

  const handleSearch = async (query: string) => {
    try {
      console.log("Starting search for:", query);

      const searchResponse = await fetch(
        `http://127.0.0.1:8000/api/search_song?query=${encodeURIComponent(
          query
        )}+official+audio`,
        // For production:
        // `https://we-dj-proxy-production.up.railway.app/api/search_song?query=${encodeURIComponent(
        //   query
        // )}+official+audio`
        {
          method: "GET",
        }
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to get song UUID");
      }

      const data = (await searchResponse.json()) as SearchResponse;
      console.log("Got UUID:", data.folder);

      // Process and display song names immediately
      const currentSongName = decodeURIComponent(data["current-song"]).replace(
        ".mp3",
        ""
      );
      const transitionSongName = decodeURIComponent(data["transition-song"])
        .replace(".mp3", "")
        .replace(" (Audio)", "");

      setTransitionData({
        folderUuid: data.folder,
        currentSong: data["current-song"],
        transitionSong: data["transition-song"],
      });

      setTitle(`${currentSongName} X ${transitionSongName}`);

      // Start polling for thumbnails and transition
      pollForThumbnails(data.folder);
      pollForTransition(data.folder);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero section with search */}
      <HeroSection onSearch={handleSearch} />

      {/* Transition Display */}
      {transitionData && (
        <div className="relative inset-x-0 top-1/2 transform -translate-y-1/2 px-6">
          <div className="w-full max-w-2xl mx-auto">
            <TransitionDisplay
              currentSong={decodeURIComponent(transitionData.currentSong)}
              transitionSong={decodeURIComponent(transitionData.transitionSong)}
              currentThumbnail={currentThumbnail || undefined}
              transitionThumbnail={transitionThumbnail || undefined}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Audio player */}
      {transitionURL && (
        <div className="px-6 mt-2">
          <div className="w-full max-w-2xl mx-auto -translate-y-1/3">
            <AudioPlayer src={transitionURL} title={title} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
