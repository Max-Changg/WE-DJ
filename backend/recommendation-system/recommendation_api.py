import subprocess
import sys
import os

def get_best_transition(filename):
    """
    Get the best DJ transition for a given filename.
    
    Args:
        filename (str): The filename to find transitions for (e.g., 'gangnam.mp3' or 'gangnam')
        
    Returns:
        str: The filename of the best transition song, or None if an error occurs
    """
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Run main.py with the filename as argument
        result = subprocess.run(
            [sys.executable, os.path.join(script_dir, 'main.py'), filename],
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

def get_transition_with_details(filename):
    """
    Get the best DJ transition with additional details about the process.
    
    Args:
        filename (str): The filename to find transitions for (e.g., 'gangnam.mp3' or 'gangnam')
        
    Returns:
        dict: Dictionary containing the best transition filename and process details
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        result = subprocess.run(
            [sys.executable, os.path.join(script_dir, 'main.py'), filename],
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
            'input_file': filename,
            'best_transition_file': best_transition,
            'full_output': result.stdout,
            'error': None
        }
        
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'input_file': filename,
            'best_transition_file': None,
            'full_output': e.stdout if e.stdout else '',
            'error': e.stderr if e.stderr else str(e)
        }
    except Exception as e:
        return {
            'success': False,
            'input_file': filename,
            'best_transition_file': None,
            'full_output': '',
            'error': str(e)
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the function
    test_files = ["gangnam.mp3", "gangnam", "mc_hammer.mp3"]
    
    print("Testing recommendation API:")
    print("=" * 40)
    
    for filename in test_files:
        print(f"\nInput: {filename}")
        result = get_best_transition(filename)
        if result:
            print(f"Best transition: {result}")
        else:
            print("No transition found or error occurred")
    
    print("\n" + "=" * 40)
    print("Testing with details:")
    
    for filename in test_files:
        print(f"\nInput: {filename}")
        result = get_transition_with_details(filename)
        if result['success']:
            print(f"Best transition file: {result['best_transition_file']}")
        else:
            print(f"Error: {result['error']}") 