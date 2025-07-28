import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.transition_generator.transition_generator import *
from trim_and_split import *

if __name__ == '__main__':
    song1 = 'mc_hammer'
    song2 = 'vanilla_ice'

    split_and_trim(song1)
    split_and_trim(song2)

    crossfade_transition(song1, song2)
    scratch_transition(song1, song2)
