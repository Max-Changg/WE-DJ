from pydub import AudioSegment

def load_stems(name):
    vocals = AudioSegment.from_file("stems/" + name + "/vocals.wav")
    bass   = AudioSegment.from_file("stems/" + name + "/bass.wav")
    drums  = AudioSegment.from_file("stems/" + name + "/drums.wav")
    other  = AudioSegment.from_file("stems/" + name + "/other.wav")
    return vocals, bass, drums, other

def build_instrumental(bass, drums, other):
    return bass.overlay(drums).overlay(other)

def crossfade_transition(song1_file, song2_file):
    song1 = song1_file + "_chorus"
    song2 = song2_file + "_chorus"
    vocals_a, bass_a, drums_a, other_a = load_stems(song1)
    vocals_b, bass_b, drums_b, other_b = load_stems(song2)
    instrumental_a = build_instrumental(bass_a, drums_a, other_a)
    instrumental_b = build_instrumental(bass_b, drums_b, other_b)
    song_a = instrumental_a.overlay(vocals_a)
    song_b = instrumental_b.overlay(vocals_b)

    vocals_a_down = 10000
    vocals_b_in = 15000
    instrumental_a_down = 20000
    instrumental_b_in = 25000
    crossfade_duration = 5000

    # Full song A
    full_a = song_a[:vocals_a_down]

    # Vocals of A fading
    a_fade_out = instrumental_a[vocals_a_down:vocals_b_in].fade_out(crossfade_duration)
    a_fade_out = a_fade_out.overlay(vocals_a[vocals_a_down:vocals_b_in].fade_out(3000))
    a_fade_out = a_fade_out.overlay(instrumental_b[0:].fade_in(crossfade_duration))

    # Vocals of B entering
    b_fade_in = vocals_b[5000:10000].fade_in(crossfade_duration)
    b_fade_in = b_fade_in.overlay(instrumental_b[5000:])

    # Instruments changing
    instruments_changing = vocals_b[10000:]
    instruments_changing = instruments_changing.overlay(instrumental_b[10000:])

    # Full song B
    full_b = song_b[10000:]

    # Full transition
    final_transition = full_a + a_fade_out + b_fade_in + instruments_changing

    final_transition.export("crossfade_dj_transition.mp3", format="mp3")
    print("DJ Transition created!")

def scratch_transition(song1_file, song2_file):
    song1 = song1_file + "_chorus"
    song2 = song2_file + "_chorus"
    vocals_a, bass_a, drums_a, other_a = load_stems(song1)
    vocals_b, bass_b, drums_b, other_b = load_stems(song2)
    instrumental_a = build_instrumental(bass_a, drums_a, other_a)
    instrumental_b = build_instrumental(bass_b, drums_b, other_b)
    song_a = instrumental_a.overlay(vocals_a)
    song_b = instrumental_b.overlay(vocals_b)
    # scratch = AudioSegment.from_file("sfx/scratch.wav")[:250]
    # silence = AudioSegment.silent(duration=100)

    scratch_start = 15000

    # Full song A
    full_a = song_a[:scratch_start]

    # Scratching
    # scratch_segment = scratch + scratch + scratch + scratch
    scratch_loop = AudioSegment.from_file("sfx/scratch_loop.wav")[:500]

    # Full song B
    full_b = song_b

    # Full transition
    final_transition = full_a + scratch_loop + full_b

    final_transition.export("scratch_dj_transition.mp3", format="mp3")
    print("DJ Transition created!")

if __name__ == '__main__':
    scratch_transition("mc_hammer", "gangnam")
