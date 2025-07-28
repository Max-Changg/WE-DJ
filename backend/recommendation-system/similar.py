import os
import json
import numpy as np
import sys

CACHE_FILE = 'analysis_cache.json'
cur_dir = os.getcwd()
SONG_COLLECTION_FOLDER = os.path.join(cur_dir, '..', 'database')  # Set your folder name here

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
                    print(f"Error analyzing {fname}: {e}")
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

def get_transition_rating(score):
    """Convert transition score to 1-10 rating (10 is best)"""
    if score <= 0.5:
        return 10
    elif score <= 1.5:
        return 9
    elif score <= 2.5:
        return 8
    elif score <= 3.5:
        return 7
    elif score <= 4.5:
        return 6
    elif score <= 5.5:
        return 5
    elif score <= 6.5:
        return 4
    elif score <= 7.5:
        return 3
    elif score <= 8.5:
        return 2
    else:
        return 1

def get_transition_reason(target_camelot, song_camelot, target_bpm, song_bpm):
    if song_camelot == 'Unknown':
        return "Unknown key (avoid)"
    
    target_num = int(target_camelot[:-1])
    target_letter = target_camelot[-1]
    song_num = int(song_camelot[:-1])
    song_letter = song_camelot[-1]
    
    bpm_diff = song_bpm - target_bpm
    bpm_text = f"{bpm_diff:+d} BPM" if bpm_diff != 0 else "same BPM"
    
    if target_letter != song_letter:
        return f"Different mode ({bpm_text})"
    elif target_num == song_num:
        return f"Same key ({bpm_text})"
    elif abs(target_num - song_num) == 1:
        return f"Adjacent harmonic ({bpm_text})"
    elif abs(target_num - song_num) == 2:
        return f"Good harmonic ({bpm_text})"
    else:
        return f"Poor harmonic ({bpm_text})"

def find_song_by_title(song_title, folder):
    """Find a song file by title in the given folder"""
    song_title_lower = song_title.lower()
    
    for fname in os.listdir(folder):
        if fname.endswith('.mp3') or fname.endswith('.wav'):
            # Extract title from filename
            file_title = extract_song_title(fname)
            
            # Check if the song title matches (case insensitive)
            if song_title_lower in file_title or file_title in song_title_lower:
                return os.path.join(folder, fname)
    
    return None

if __name__ == "__main__":
    # Check if song title is provided as command line argument
    if len(sys.argv) < 2:
        print("Usage: python similar.py <song_title>")
        print("Example: python similar.py 'Gangnam Style'")
        exit(1)
    
    song_title = sys.argv[1]
    print(f"Searching for song: {song_title}")
    
    # Find the song in the database folder
    user_file = find_song_by_title(song_title, SONG_COLLECTION_FOLDER)
    
    if not user_file:
        print(f"Song '{song_title}' not found in the database folder.")
        print("Available songs:")
        for fname in os.listdir(SONG_COLLECTION_FOLDER):
            if fname.endswith('.mp3') or fname.endswith('.wav'):
                print(f"  - {extract_song_title(fname).title()}")
        exit(1)
    
    print(f"Found song: {os.path.basename(user_file)}")
    
    cache = load_cache()
    user_path = os.path.abspath(user_file)
    if user_path in cache:
        user_bpm, user_key, user_scale, user_camelot = cache[user_path]
    else:
        user_bpm, user_key, user_scale, user_camelot = analyze_audio(user_file)
        cache[user_path] = [user_bpm, user_key, user_scale, user_camelot]
    print(f"Your song: BPM={user_bpm:.1f}, Key={user_key} {user_scale.title()} (Camelot: {user_camelot})")

    print(f"Analyzing your collection in '{SONG_COLLECTION_FOLDER}' (this may take a while the first time)...")
    song_db = build_song_db(SONG_COLLECTION_FOLDER, cache)
    save_cache(cache)

    print("Finding best DJ transitions...")
    similar = compare_songs(user_bpm, user_key, user_scale, song_db, exclude_file=user_file)
    
    print(f"\nBest DJ transitions for '{extract_song_title(os.path.basename(user_file)).title()}' ({user_camelot}, {user_bpm:.0f} BPM):")
    
    # Create array of file names
    file_names = [song['file'] for song in similar]
    print(file_names)
