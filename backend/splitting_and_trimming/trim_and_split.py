import os
from stem_splitter import batch_process_songs, process_single
from trim_to_chorus import extract_chorus

def split_and_trim_all():
    cur_dir = os.getcwd()
    song_chorus_names = []

    # chorus extraction
    for filename in os.listdir(cur_dir + "/backend/database/"):
        if filename.lower().endswith(".mp3"):
            song_name = filename[:-4]
            song_chorus_names.append(cur_dir + "/backend/database/choruses/" + song_name + "_chorus.mp3")
            print(f"Extracting song {song_name}!")
            extract_chorus(cur_dir + "/backend/database/" + song_name + ".mp3", cur_dir + "/backend/database/choruses/" + song_name + "_chorus.mp3", duration=30)

    # stem splitting
    print("Starting audio separation...")
    batch_process_songs(song_chorus_names, cur_dir + "/backend/database/stems/")
    print("Separation complete!")

def split_and_trim(song_name):
    cur_dir = os.getcwd()
    
    # chorus extraction
    print(f"Extracting song {song_name}!")
    extract_chorus(cur_dir + "/backend/database/" + song_name + ".mp3", cur_dir + "/backend/database/choruses/" + song_name + "_chorus.mp3", duration=30)

    print(f"Splitting song {song_name}!")
    process_single(cur_dir + "/backend/database/choruses/" + song_name + "_chorus.mp3", cur_dir + "/backend/database/stems/")

if __name__ == '__main__':
    split_and_trim('gangnam')