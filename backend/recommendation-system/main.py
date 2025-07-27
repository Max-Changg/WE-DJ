import subprocess
import sys

def run_similar_py():
    """Run similar.py and capture its output"""
    try:
        result = subprocess.run([sys.executable, 'similar.py'], 
                              capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return None

def run_best_song_py(similar_output):
    """Run best_song.py with the output from similar.py"""
    try:
        result = subprocess.run([sys.executable, 'best_song.py'], 
                              input=similar_output, text=True, 
                              capture_output=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return None

def main():
    # Run similar.py
    similar_output = run_similar_py()
    if not similar_output:
        return
    
    # Run best_song.py with the output from similar.py
    best_song_output = run_best_song_py(similar_output)
    if not best_song_output:
        return
    
    # Extract just the song title from the output
    lines = best_song_output.strip().split('\n')
    for line in lines:
        if line.startswith('Best song: '):
            song_title = line.replace('Best song: ', '').strip()
            print(song_title)
            break

if __name__ == "__main__":
    main() 