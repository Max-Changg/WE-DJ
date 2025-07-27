import yt_dlp
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import uuid
import tempfile
import shutil

load_dotenv()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def save_to_database_folder(filepath, destination_folder="./database"):
    os.makedirs(destination_folder, exist_ok=True)
    filename = os.path.basename(filepath)
    destination_path = os.path.join(destination_folder, filename)
    shutil.copy2(filepath, destination_path)
    return destination_path


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
                'id': entry.get('id'),
                'channel': entry.get('uploader'),
                'duration': entry.get('duration')
            })
        return results

def download_song(youtube_url, output_dir=None):
    if output_dir is None:
        # Create a temp directory
        temp_dir = tempfile.TemporaryDirectory()
        output_dir = temp_dir.name
    else:
        os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_dir}/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
        'quiet': False,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=True)
        filename = ydl.prepare_filename(info)
        filename = os.path.splitext(filename)[0] + ".mp3"

    # Return both filename and temp_dir so caller can keep temp_dir alive
    return filename, temp_dir if 'temp_dir' in locals() else None

def upload_to_supabase(file_path, bucket_name="temp-audio-storage"):
    unique_name = f"{uuid.uuid4().hex}"  # unique prefix
    with open(file_path, "rb") as f:
        data = f.read()

    supabase.storage.from_(bucket_name).upload(unique_name, data)

    public_url = supabase.storage.from_(bucket_name).get_public_url(unique_name)
    return public_url

def find_and_download_song(query):
    results = search_youtube(query)
    chosen = results[0]

    print(f"Downloading: {chosen['title']}")
    filepath, temp_dir = download_song(chosen['url'])

    print("Uploading to Supabase...")
    public_url = upload_to_supabase(filepath)

    if public_url:
        print(f"Uploaded successfully! Public URL: {public_url}")
    else:
        print("Upload failed.")

    print("Saving MP3 to local database folder...")
    local_path = save_to_database_folder(filepath)
    print(f"Saved to: {local_path}")

    # Cleanup temp folder if used
    if temp_dir:
        temp_dir.cleanup()