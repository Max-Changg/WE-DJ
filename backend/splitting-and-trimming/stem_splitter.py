import torch
import torchaudio
import soundfile as sf
import os
from multiprocessing import Pool
from functools import partial
from demucs.pretrained import get_model
from demucs.apply import apply_model

def load_audio_fallback(file_path):
    """Load audio with multiple fallback methods"""
    try:
        # First try torchaudio with FFmpeg backend
        wav, sample_rate = torchaudio.load(file_path)
        return wav, sample_rate
    except RuntimeError as e:
        print(f"Torchaudio failed: {e}. Trying soundfile fallback...")
        try:
            # Soundfile fallback
            data, sample_rate = sf.read(file_path, dtype='float32')
            if len(data.shape) == 1:  # Mono
                data = data.reshape(1, -1)
            else:  # Stereo
                data = data.T
            return torch.from_numpy(data), sample_rate
        except Exception as e:
            raise RuntimeError(f"All audio loading methods failed: {e}")

def split_audio_with_demucs(input_file, output_dir):
    """Robust audio separation with multiple fallbacks"""
    # Verify file exists
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} does not exist")
    
    # Load model
    model = get_model(name='htdemucs')
    
    # Load audio with fallback
    try:
        wav, rate = load_audio_fallback(input_file)
    except Exception as e:
        raise RuntimeError(f"Failed to load audio file: {e}")
    
    # Process audio
    try:
        sources = apply_model(model, wav.unsqueeze(0), device='cpu')
    except Exception as e:
        raise RuntimeError(f"Audio processing failed: {e}")
    
    # Save results
    os.makedirs(output_dir, exist_ok=True)
    for stem, name in zip(sources[0], ['drums', 'bass', 'other', 'vocals']):
        output_path = os.path.join(output_dir, f"{name}.wav")
        torchaudio.save(output_path, stem, rate)
        print(f"Saved {name} to {output_path}")

def process_single(song_path, output_dir):
    """Process one song and save to its own subfolder"""
    song_name = os.path.splitext(os.path.basename(song_path))[0]
    song_output_dir = os.path.join(output_dir, song_name)
    os.makedirs(song_output_dir, exist_ok=True)
    
    # Your existing separation function
    split_audio_with_demucs(song_path, song_output_dir)
    return song_output_dir

def batch_process_songs(song_paths, output_dir):
    """Process multiple songs with parallel processing, saving each to its own subfolder"""
    
    # Create main output directory if needed
    os.makedirs(output_dir, exist_ok=True)
    
    # Process in parallel
    with Pool() as pool:
        from functools import partial
        func = partial(process_single, output_dir=output_dir)
        results = pool.map(func, song_paths)
    
    return results  # Returns list of created directories
