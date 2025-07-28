#!/usr/bin/env python3

import os
import json
import numpy as np
import sys

CACHE_FILE = 'analysis_cache.json'
# Use absolute path to database folder
script_dir = os.path.dirname(os.path.abspath(__file__))
SONG_COLLECTION_FOLDER = os.path.join(script_dir, '..', 'database')  # Set your folder name here

# Camelot mapping for (key, scale)
CAMELOT_MAP = {
    ('C', 'major'): '8B', ('C#', 'major'): '3B', ('D', 'major'): '10B', ('D#', 'major'): '5B',
    ('E', 'major'): '12B', ('F', 'major'): '7B', ('F#', 'major'): '2B', ('G', 'major'): '9B',
    ('G#', 'major'): '4B', ('A', 'major'): '11B', ('A#', 'major'): '6B', ('B', 'major'): '1B',
    ('C', 'minor'): '5A', ('C#', 'minor'): '12A', ('D', 'minor'): '7A', ('D#', 'minor'): '2A',
    ('E', 'minor'): '9A', ('F', 'minor'): '4A', ('F#', 'minor'): '11A', ('G', 'minor'): '6A',
    ('G#', 'minor'): '1A', ('A', 'minor'): '8A', ('A#', 'minor'): '3A', ('B', 'minor'): '10A',
}

def normalize_key(key):
    # Map flats to sharps
    flat_to_sharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    }
    return flat_to_sharp.get(key, key)

def analyze_audio(file_path):
    try:
        import essentia.standard as es
    except ImportError:
        print("Essentia is required for key/mode/Camelot detection. Please install it with 'pip install essentia'.")
        exit(1)
    audio = es.MonoLoader(filename=file_path)()
    key, scale, strength = es.KeyExtractor()(audio)
    key = normalize_key(key)
    camelot = CAMELOT_MAP.get((key, scale), 'Unknown')
    # For BPM, use librosa
    import librosa
    y, sr = librosa.load(file_path, duration=60)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, np.ndarray):
        tempo = float(tempo.mean())
    else:
        tempo = float(tempo)
    return tempo, key, scale, camelot

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
        # Re-normalize old cache entries (2 values: bpm, key)
        updated = False
        for path, value in list(cache.items()):
            if len(value) == 2:
                bpm, key = value
                key = normalize_key(key)
                # Default to 'major' if scale is unknown (or you can re-analyze if you want)
                scale = 'major'
                camelot = CAMELOT_MAP.get((key, scale), 'Unknown')
                cache[path] = [bpm, key, scale, camelot]
                updated = True
        if updated:
            save_cache(cache)
        return cache
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

def extract_song_title(filename):
    base = os.path.splitext(filename)[0]
    return base.split(' - ')[0].strip().lower()

def build_song_db(folder, cache):
    db = []
    for fname in os.listdir(folder):
        if fname.endswith('.mp3') or fname.endswith('.wav'):
            path = os.path.abspath(os.path.join(folder, fname))
            if path in cache:
                bpm, key, scale, camelot = cache[path]
            else:
                try:
                    bpm, key, scale, camelot = analyze_audio(path)
                    cache[path] = [bpm, key, scale, camelot]
                except Exception as e:
                    # Suppress error messages for corrupted/invalid files
                    continue
            db.append({'file': fname, 'bpm': bpm, 'key': key, 'scale': scale, 'camelot': camelot, 'path': path, 'title': extract_song_title(fname)})
    return db

def dj_transition_score(target_bpm, target_camelot, song):
    # BPM scoring (closer is better, but allow some flexibility)
    bpm_diff = abs(song['bpm'] - target_bpm)
    bpm_score = min(bpm_diff, 8)  # Cap at 8 BPM difference
    
    # Camelot scoring (harmonic compatibility)
    if song['camelot'] == 'Unknown':
        camelot_score = 10  # Heavy penalty for unknown
    else:
        target_num = int(target_camelot[:-1])  # Extract number from "8A"
        target_letter = target_camelot[-1]     # Extract letter from "8A"
        song_num = int(song['camelot'][:-1])
        song_letter = song['camelot'][-1]
        
        if target_letter != song_letter:  # Different modes (major/minor)
            camelot_score = 10  # Heavy penalty
        else:
            distance = abs(target_num - song_num)
            if distance == 0:      # Same key
                camelot_score = 0
            elif distance == 1:    # Adjacent
                camelot_score = 1
            elif distance == 2:    # 2 apart
                camelot_score = 3
            else:                  # 3+ apart
                camelot_score = 8
    
    return bpm_score + camelot_score * 2  # Weight harmonic compatibility more

def compare_songs(target_bpm, target_key, target_scale, song_db, exclude_file=None):
    exclude_title = extract_song_title(os.path.basename(exclude_file)) if exclude_file else None
    scored = []
    
    for song in song_db:
        # Exclude if song title matches input song title
        if exclude_title and song['title'] == exclude_title:
            continue
        
        score = dj_transition_score(target_bpm, song['camelot'], song)
        scored.append((score, song))
    
    scored.sort(key=lambda x: x[0])
    return [s[1] for s in scored[:10]]

def find_song_by_filename(filename, folder):
    """Find a song file by exact filename in the given folder"""
    # Check if the filename already has an extension
    if not filename.endswith(('.mp3', '.wav')):
        # Try with common extensions
        for ext in ['.mp3', '.wav']:
            full_filename = filename + ext
            file_path = os.path.join(folder, full_filename)
            if os.path.exists(file_path):
                return file_path
    
    # Try the exact filename as provided
    file_path = os.path.join(folder, filename)
    if os.path.exists(file_path):
        return file_path
    
    return None

def find_best_song(file_names):
    """Find the best song file from the list"""
    if not file_names:
        return None
    
    # The first file in the array is already the best (sorted by score)
    return file_names[0]

def get_best_transition(filename):
    """
    Get the best DJ transition for a given filename.
    
    Args:
        filename (str): The filename to find transitions for (e.g., 'gangnam.mp3' or 'gangnam')
        
    Returns:
        str: The filename of the best transition song, or None if an error occurs
    """
    try:
        # Find the song in the database folder
        user_file = find_song_by_filename(filename, SONG_COLLECTION_FOLDER)
        
        if not user_file:
            print(f"File '{filename}' not found in the database folder.")
            return None
        
        # Load cache and analyze the user's song
        cache = load_cache()
        user_path = os.path.abspath(user_file)
        
        if user_path in cache:
            user_bpm, user_key, user_scale, user_camelot = cache[user_path]
        else:
            user_bpm, user_key, user_scale, user_camelot = analyze_audio(user_file)
            cache[user_path] = [user_bpm, user_key, user_scale, user_camelot]
        
        # Build the song database
        song_db = build_song_db(SONG_COLLECTION_FOLDER, cache)
        save_cache(cache)
        
        # Find similar songs
        similar = compare_songs(user_bpm, user_key, user_scale, song_db, exclude_file=user_file)
        
        # Get file names
        file_names = [song['file'] for song in similar]
        
        # Find the best song
        best_file = find_best_song(file_names)
        
        return best_file
            
    except Exception as e:
        print(f"Error in get_best_transition: {e}")
        return None

# Command line interface (like the original files)
if __name__ == "__main__":
    # Check if filename is provided as command line argument
    if len(sys.argv) < 2:
        print("Usage: python combined_recommendation.py <filename>")
        print("Example: python combined_recommendation.py 'gangnam.mp3'")
        print("Example: python combined_recommendation.py 'gangnam'")
        exit(1)
    
    filename = sys.argv[1]
    print(f"Finding best transition for: {filename}")
    
    result = get_best_transition(filename)
    if result:
        print(result)
    else:
        print("No transition found or error occurred") 