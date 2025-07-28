import subprocess
import sys

def run_similar_py(filename):
    """Run similar.py with a filename and capture its output"""
    try:
        result = subprocess.run([sys.executable, 'similar.py', filename], 
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
    # Check if filename is provided as command line argument
    if len(sys.argv) < 2:
        print("Usage: python main.py <filename>")
        print("Example: python main.py 'gangnam.mp3'")
        print("Example: python main.py 'gangnam'")
        return
    
    filename = sys.argv[1]
    print(f"Finding best transition for: {filename}")
    
    # Run similar.py with the filename
    similar_output = run_similar_py(filename)
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
            print(song_title)  # Print the result to stdout
            return song_title

if __name__ == "__main__":
    main() 