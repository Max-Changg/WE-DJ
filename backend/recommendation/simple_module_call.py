#!/usr/bin/env python3

import os
import sys

def call_similar_py(filename):
    """Call similar.py as a module"""
    # Save original sys.argv
    original_argv = sys.argv.copy()
    
    # Set sys.argv to simulate command line call
    sys.argv = ['similar.py', filename]
    
    # Import and run similar.py
    import similar
    
    # Find the song
    user_file = similar.find_song_by_filename(filename, similar.SONG_COLLECTION_FOLDER)
    if not user_file:
        print(f"File '{filename}' not found.")
        sys.argv = original_argv
        return None
    
    # Analyze the song
    cache = similar.load_cache()
    user_path = os.path.abspath(user_file)
    
    if user_path in cache:
        user_bpm, user_key, user_scale, user_camelot = cache[user_path]
    else:
        user_bpm, user_key, user_scale, user_camelot = similar.analyze_audio(user_file)
        cache[user_path] = [user_bpm, user_key, user_scale, user_camelot]
    
    # Build database and find similar songs
    song_db = similar.build_song_db(similar.SONG_COLLECTION_FOLDER, cache)
    similar.save_cache(cache)
    similar_songs = similar.compare_songs(user_bpm, user_key, user_scale, song_db, exclude_file=user_file)
    
    # Get file names (like similar.py outputs)
    file_names = [song['file'] for song in similar_songs]
    
    # Restore sys.argv
    sys.argv = original_argv
    
    return file_names

def call_best_song_py(file_names):
    """Call best_song.py as a module"""
    import best_song
    
    # Use best_song.py's function to find the best song
    best_file = best_song.find_best_song(file_names)
    return best_file

def get_best_transition_simple(filename):
    """
    Get best transition by calling similar.py and best_song.py as modules.
    
    Args:
        filename (str): The filename to find transitions for
        
    Returns:
        str: The filename of the best transition song
    """
    # Step 1: Call similar.py
    file_names = call_similar_py(filename)
    if not file_names:
        return None
    
    # Step 2: Call best_song.py
    best_file = call_best_song_py(file_names)
    return best_file

# Test
if __name__ == "__main__":
    test_files = ["gangnam.mp3", "mc_hammer.mp3", "We Are Young - Fun.mp3"]
    
    print("Testing simple module calls:")
    print("=" * 40)
    
    for filename in test_files:
        print(f"\nInput: {filename}")
        result = get_best_transition_simple(filename)
        if result:
            print(f"Output: {result}")
        else:
            print("No result found") 