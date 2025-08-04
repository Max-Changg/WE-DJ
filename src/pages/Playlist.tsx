import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowBigRight } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState } from "react";

const Playlist = () => {
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [keyValue, setKeyValue] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");

  const handleSearch = async (songs: string) => {
    setIsLoading(true);
    setPlaylistUrl(null);

    const songs_split = songs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const response = await fetch(
        "https://we-dj-proxy-production.up.railway.app/api/create_playlist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songs: songs_split }),
        }
      );

      if (!response.ok) throw new Error("Failed to create playlist");

      const folder_uuid = await response.json();

      // Instead of fetching the file blob, just store the URL for streaming
      setPlaylistUrl(
        `https://we-dj-proxy-production.up.railway.app/api/get_playlist?playlist_uuid=${folder_uuid}`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 flex justify-center">
      {keyValue !== "wedjsecret" && keyValue !== "wedj" && (
        <div className="flex flex-row gap-2">
          <Input
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password..."
          />
          <Button
            size="sm"
            variant="outline"
            className="h-10 w-10 p-0"
            onClick={() => {
              setKeyValue(passwordInput);
            }}
          >
            <ArrowBigRight />
          </Button>
        </div>
      )}
      {keyValue == "wedjsecret" ||
        (keyValue == "wedj" && (
          <div className="mt-40 flex flex-col gap-2">
            Enter a comma-separated list of songs and artists (e.g. Bohemian
            Rhapsody Queen, Part of Me Katy Perry, etc)
            <div className="flex flex-row gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0"
                disabled={isLoading}
                onClick={() => handleSearch(inputValue)}
              >
                <ArrowBigRight />
              </Button>
            </div>
            {playlistUrl && (
              <AudioPlayer src={playlistUrl} className="self-center" />
            )}
          </div>
        ))}
    </div>
  );
};

export default Playlist;
