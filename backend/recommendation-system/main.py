import subprocess
import sys

def run_similar_py(song_title):
    """Run similar.py with a song title and capture its output"""
    try:
        result = subprocess.run([sys.executable, 'similar.py', song_title], 
                              capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running similar.py: {e}")
        print(f"stderr: {e.stderr}")
        return None

def run_best_song_py(similar_output):
    """Run best_song.py with the output from similar.py"""
    try:
        result = subprocess.run([sys.executable, 'best_song.py'], 
                              input=similar_output, text=True, 
                              capture_output=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running best_song.py: {e}")
        print(f"stderr: {e.stderr}")
        return None

def main():
    # Check if song title is provided as command line argument
    if len(sys.argv) < 2:
        print("Usage: python main.py <song_title>")
        print("Example: python main.py 'Gangnam Style'")
        return
    
    song_title = sys.argv[1]
    print(f"Finding best transition for: {song_title}")
    
    # Run similar.py with the song title
    similar_output = run_similar_py(song_title)
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
            return song_title

if __name__ == "__main__":
    main() 