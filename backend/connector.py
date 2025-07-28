import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))

# Append 'recommendation-system' before importing
another_dir = os.path.join(current_dir, 'recommendation-system')
sys.path.append(another_dir)
from recommendation_api import get_best_transition

# Append 'splitting-and-trimming' before importing
another_dir = os.path.join(current_dir, 'splitting-and-trimming')
sys.path.append(another_dir)
from trim_and_split import split_and_trim

# Append 'transition-generator' before importing
another_dir = os.path.join(current_dir, 'transition_generator')
sys.path.append(another_dir)
from transition_generator import crossfade_transition, scratch_transition


def connect(song1):
    song2 = get_best_transition(song1)
    print(song2)

    split_and_trim(song1)
    split_and_trim(song2)

    crossfade_transition(song1, song2)
    scratch_transition(song1, song2)

if __name__ == '__main__':
    connect('gangnam')
