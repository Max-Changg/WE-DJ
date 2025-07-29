import os
from .stem_splitter import batch_process_songs, process_single
from .trim_to_chorus import extract_chorus

cur_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(cur_dir, ".."))
database_dir = os.path.join(backend_dir, "database")
chorus_dir = os.path.join(database_dir, "choruses")
stems_dir = os.path.join(database_dir, "stems")

# Ensure subfolders exist
os.makedirs(chorus_dir, exist_ok=True)
os.makedirs(stems_dir, exist_ok=True)

def split_and_trim_all():
    song_chorus_names = []

    for filename in os.listdir(database_dir):
        if filename.lower().endswith(".mp3"):
            song_name = filename[:-4]
            input_path = os.path.join(database_dir, filename)
            chorus_path = os.path.join(chorus_dir, f"{song_name}_chorus.mp3")

            print(f"Extracting song {song_name}!")
            extract_chorus(input_path, chorus_path, duration=30)
            song_chorus_names.append(chorus_path)

    print("Starting audio separation...")
    batch_process_songs(song_chorus_names, stems_dir)
    print("Separation complete!")

def split_and_trim(song_name):
    print("cur_dir:", cur_dir)
    print("backend_dir:", backend_dir)
    print("database_dir:", database_dir)
    input_path = os.path.join(database_dir, f"{song_name}.mp3")
    chorus_path = os.path.join(chorus_dir, f"{song_name}_chorus.mp3")

    print(f"Extracting song {song_name}!")
    extract_chorus(input_path, chorus_path, duration=30)

    print(f"Splitting song {song_name}!")
    process_single(chorus_path, stems_dir)

if __name__ == '__main__':
    split_and_trim('i_like_it')
    split_and_trim('thats_what_i_like')
