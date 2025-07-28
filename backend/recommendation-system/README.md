# Recommendation System

This system finds the best DJ transitions for a given song by analyzing BPM, key, and harmonic compatibility.

## Usage

### Main Script
```bash
python3 main.py "<song_title>"
```

### Examples
```bash
python3 main.py "Gangnam"
python3 main.py "Any Song"
python3 main.py "MC Hammer"
```

### Direct Usage
You can also run the individual scripts directly:

```bash
# Find similar songs for a given song title
python3 similar.py "<song_title>"

# Find the best song from a list (used internally)
python3 best_song.py
```

## How it Works

1. **Song Search**: The system searches for the specified song title in the `../database/` folder
2. **Audio Analysis**: Analyzes the found song for BPM, key, scale, and Camelot wheel position
3. **Similarity Matching**: Compares the song against all other songs in the database
4. **Transition Scoring**: Scores each potential transition based on:
   - BPM compatibility (closer is better)
   - Harmonic compatibility using the Camelot wheel
   - Mode compatibility (major/minor)
5. **Recommendation**: Returns the best transition song

## Features

- **Fuzzy Matching**: Searches for songs using partial title matching
- **Caching**: Caches audio analysis results for faster subsequent runs
- **Error Handling**: Shows available songs if the requested song is not found
- **Harmonic Analysis**: Uses the Camelot wheel for DJ-friendly harmonic transitions

## Dependencies

- `essentia`: For audio analysis and key detection
- `librosa`: For BPM detection
- `numpy`: For numerical operations

## Database Structure

The system expects songs to be stored in `../database/` with filenames in the format:
`Artist - Song Title.mp3` or `Song Title.mp3`

The system will extract the song title from the filename for matching.
