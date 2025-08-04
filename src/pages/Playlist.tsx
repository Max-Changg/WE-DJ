import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowBigRight } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState } from "react";

const Playlist = () => {
  const [playlistFile, setPlaylistFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [keyValue, setKeyValue] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");

  const handleSearch = async (songs: string) => {
    setIsLoading(true);
    setPlaylistFile(null);
    let songs_split: string[] = [];
    if (keyValue == "wedj") {
      songs_split = songs
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 10);
    } else {
      songs_split = songs.split(",");
    }
    try {
      const response = await fetch(
        `https://we-dj-proxy-production.up.railway.app/api/create_playlist`,
        {
          method: "POST",
          body: JSON.stringify({ songs: songs_split }),
        }
      );

      const folder_uuid = await response.json();

      const response2 = await fetch(
        `https://we-dj-proxy-production.up.railway.app/api/get_playlist?playlist_uuid=${folder_uuid}`,
        {
          method: "GET",
        }
      );

      const blob = await response2.blob();
      setPlaylistFile(URL.createObjectURL(blob));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
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
            {playlistFile && (
              <AudioPlayer src={playlistFile} className="self-center" />
            )}
          </div>
        ))}
    </div>
  );
};

export default Playlist;
