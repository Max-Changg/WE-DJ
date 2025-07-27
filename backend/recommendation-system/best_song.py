import ast
import sys

def parse_song_titles(output_text):
    """Parse the song titles array from the output of similar.py"""
    try:
        # Look for a line that contains a list of song titles
        lines = output_text.strip().split('\n')
        for line in lines:
            line = line.strip()
            # Look for any line that starts with [ and ends with ]
            if line.startswith('[') and line.endswith(']'):
                # Parse the Python list
                song_titles = ast.literal_eval(line)
                return song_titles
        return None
    except Exception as e:
        print(f"Error parsing song titles: {e}")
        return None

def find_best_song(song_titles):
    """Find the best song from the top 10"""
    if not song_titles:
        return None
    
    # The first song in the array is already the best from similar.py
    return song_titles[0]

def main():
    # Read input from stdin (piped from similar.py)
    if not sys.stdin.isatty():
        # Read from pipe
        output_text = sys.stdin.read()
    else:
        # Read from file or manual input
        print("Paste the output from similar.py:")
        output_text = input()
    
    # Parse the song titles
    song_titles = parse_song_titles(output_text)
    
    if song_titles:
        # Find the best song
        best_song_title = find_best_song(song_titles)
        print(f"Best song: {best_song_title}")
    else:
        print("No song titles found")
        print("Debug: Here's what I received:")
        print(repr(output_text))

if __name__ == "__main__":
    main() 