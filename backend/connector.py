import os
import sys
import requests

current_dir = os.path.dirname(os.path.abspath(__file__))
another_dir = os.path.join(current_dir, '..', 'recommendation-system')
sys.path.append(another_dir)
from recommendation_api import get_best_transition
another_dir = os.path.join(current_dir, '..', 'splitting-and-trimming')
sys.path.append(another_dir)
from trim_and_split import split_and_trim
another_dir = os.path.join(current_dir, '..', 'transition-generator')
sys.path.append(another_dir)
from transition_generator import crossfade_transition, scratch_transition


def connect(song1):
    song2 = get_best_transition(song1)

    split_and_trim(song1)
    split_and_trim(song2)

    crossfade_transition(song1, song2)
    scratch_transition(song1, song2)
