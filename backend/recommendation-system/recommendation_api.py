import subprocess
import sys
import os

def get_best_transition(song_title):
    """
    Get the best DJ transition for a given song title.
    
    Args:
        song_title (str): The title of the song to find transitions for
        
    Returns:
        str: The filename of the best transition song, or None if an error occurs
    """
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Run main.py with the song title as argument
        result = subprocess.run(
            [sys.executable, os.path.join(script_dir, 'main.py'), song_title],
            capture_output=True,
            text=True,
            check=True,
            cwd=script_dir  # Run from the script directory
        )
        
        # Extract the song title from the output
        output_lines = result.stdout.strip().split('\n')
        for line in output_lines:
            if line and not line.startswith('Finding best transition for:') and not line.startswith('Error'):
                return line.strip()
        
        # If no valid line found, return None
        return None
        
    except subprocess.CalledProcessError as e:
        print(f"Error running recommendation system: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def get_transition_with_details(song_title):
    """
    Get the best DJ transition with additional details about the process.
    
    Args:
        song_title (str): The title of the song to find transitions for
        
    Returns:
        dict: Dictionary containing the best transition filename and process details
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        result = subprocess.run(
            [sys.executable, os.path.join(script_dir, 'main.py'), song_title],
            capture_output=True,
            text=True,
            check=True,
            cwd=script_dir
        )
        
        # Parse the output
        output_lines = result.stdout.strip().split('\n')
        best_transition = None
        
        for line in output_lines:
            if line and not line.startswith('Finding best transition for:') and not line.startswith('Error'):
                best_transition = line.strip()
                break
        
        return {
            'success': True,
            'input_song': song_title,
            'best_transition_file': best_transition,
            'full_output': result.stdout,
            'error': None
        }
        
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'input_song': song_title,
            'best_transition_file': None,
            'full_output': e.stdout if e.stdout else '',
            'error': e.stderr if e.stderr else str(e)
        }
    except Exception as e:
        return {
            'success': False,
            'input_song': song_title,
            'best_transition_file': None,
            'full_output': '',
            'error': str(e)
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the function
    test_songs = ["gangnam", "Any Song", "MC Hammer"]
    
    print("Testing recommendation API:")
    print("=" * 40)
    
    for song in test_songs:
        print(f"\nInput: {song}")
        result = get_best_transition(song)
        if result:
            print(f"Best transition: {result}")
        else:
            print("No transition found or error occurred")
    
    print("\n" + "=" * 40)
    print("Testing with details:")
    
    for song in test_songs:
        print(f"\nInput: {song}")
        result = get_transition_with_details(song)
        if result['success']:
            print(f"Best transition file: {result['best_transition_file']}")
        else:
            print(f"Error: {result['error']}") 