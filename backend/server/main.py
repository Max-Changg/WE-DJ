from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import sys
import os

current_dir = os.path.dirname(__file__)

# Get the parent directory (the one containing 'search-download' and 'server')
parent_dir = os.path.join(current_dir, '..')

# Add the parent directory to sys.path
sys.path.append(parent_dir)

from search.search import find_and_download_song
from splitting_and_trimming.trim_and_split import split_and_trim
from recommendation.combined_recommendation import get_best_transition
from transition_generator.transition_generator import crossfade_transition, scratch_transition

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/api/search_song')
def search_song(query: str):
    song_name = find_and_download_song(query)[:-4]
    song2 = get_best_transition(song_name)[:-4]
    split_and_trim(song_name)
    split_and_trim(song2)
    crossfade_transition(song_name, song2)
    scratch_transition(song_name, song2)