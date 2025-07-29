import librosa
import soundfile as sf
import os

def match(source_path, target_path):
    # === Load both audio files ===
    source_audio, sr = librosa.load(source_path, sr=None)
    target_audio, _ = librosa.load(target_path, sr=sr)

    # === Estimate BPM of both ===
    source_bpm = librosa.beat.tempo(y=source_audio, sr=sr)[0]
    target_bpm = librosa.beat.tempo(y=target_audio, sr=sr)[0]

    print(f"Source BPM: {source_bpm:.2f}, Target BPM: {target_bpm:.2f}")

    # === Compute time-stretch rate ===
    stretch_ratio = source_bpm / target_bpm

    # === Apply time-stretch ===
    stretched_audio = librosa.effects.time_stretch(source_audio, rate=stretch_ratio)

    # === Save stretched version ===
    output_path = source_path[:-4] + "_matched.wav"
    sf.write(output_path, stretched_audio, sr)
    print(f"Saved time-stretched file to match BPM at: {output_path}")

    return source_bpm, target_bpm

def match_all(source_path, target_path):
    for filename in os.listdir(source_path):
        current_source_file_path = os.path.join(source_path, filename)
        current_target_file_path = os.path.join(target_path, filename)

        match(current_source_file_path, current_target_file_path)
        
if __name__ == '__main__':
    match_all('stems/vanilla_ice_chorus', 'stems/mc_hammer_chorus')

