import yt_dlp

def search_youtube(query, max_results=5):
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        search_query = f"ytsearch{max_results}:{query}"
        info = ydl.extract_info(search_query, download=False)

        results = []
        for entry in info.get('entries', []):
            results.append({
                'title': entry.get('title'),
                'url': f"https://www.youtube.com/watch?v={entry.get('id')}",
                'channel': entry.get('uploader'),
                'duration': entry.get('duration')
            })
        return results

# Example usage
if __name__ == "__main__":
    query = input("Enter song search: ")
    results = search_youtube(query)
    for idx, video in enumerate(results, 1):
        print(f"{idx}. {video['title']} by {video['channel']}")
        print(f"   {video['url']} ({video['duration']}s)\n")
