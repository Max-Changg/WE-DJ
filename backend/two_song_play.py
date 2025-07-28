from splitting_and_trimming.trim_and_split import *
from transition_generator.transition_generator import *

if __name__ == '__main__':
    song1 = 'mc_hammer'
    song2 = 'ZEZE (feat. Travis Scott & Offset) - Kodak Black'

    split_and_trim(song1)
    split_and_trim(song2)

    crossfade_transition(song1, song2)
    scratch_transition(song1, song2)


