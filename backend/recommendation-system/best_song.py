import ast
import sys

def parse_file_names(output_text):
    """Parse the file names array from the output of similar.py"""
    try:
        # Look for a line that contains a list of file names
        lines = output_text.strip().split('\n')
        for line in lines:
            line = line.strip()
            # Look for any line that starts with [ and ends with ]
            if line.startswith('[') and line.endswith(']'):
                # Parse the Python list
                file_names = ast.literal_eval(line)
                return file_names
        return None
    except Exception as e:
        print(f"Error parsing file names: {e}")
        return None

def find_best_song(file_names):
    """Find the best song file from the top 10"""
    if not file_names:
        return None
    
    # The first file in the array is already the best from similar.py
    return file_names[0]

def main():
    # Read input from stdin (piped from similar.py)
    if not sys.stdin.isatty():
        # Read from pipe
        output_text = sys.stdin.read()
    else:
        # Read from file or manual input
        print("Paste the output from similar.py:")
        output_text = input()
    
    # Parse the file names
    file_names = parse_file_names(output_text)
    
    if file_names:
        # Find the best song file
        best_song_file = find_best_song(file_names)
        print(f"Best song: {best_song_file}")
    else:
        print("No file names found")
        print("Debug: Here's what I received:")
        print(repr(output_text))

if __name__ == "__main__":
    main() 