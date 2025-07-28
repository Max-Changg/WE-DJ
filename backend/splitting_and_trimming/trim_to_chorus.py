import librosa
import numpy as np
from pydub import AudioSegment
import tempfile


def extract_chorus(input_mp3, output_path, duration=15):
    """
    Extracts the most energetic 15-second segment (chorus-like) from an MP3
    """
    # Convert MP3 to WAV temporarily (librosa works better with WAV)
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmpfile:
        audio = AudioSegment.from_mp3(input_mp3)
        audio.export(tmpfile.name, format="wav")
        
        # Load with librosa
        y, sr = librosa.load(tmpfile.name, sr=None)
    
    # Get onset envelopes (for beat/energy detection)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    
    # Find the most energetic 15-second window
    frame_length = sr * duration
    energy = np.convolve(onset_env, np.ones(int(frame_length/512)), 'valid')  # 512 = hop length
    
    max_pos = np.argmax(energy)
    start_time = max_pos * 512 / sr  # Convert frames to seconds
    
    # Extract segment using pydub
    start_ms = start_time * 1000
    end_ms = start_ms + (duration * 1000)
    chorus = audio[start_ms:end_ms]
    
    # Export result
    chorus.export(output_path, format="mp3")
    return output_path
