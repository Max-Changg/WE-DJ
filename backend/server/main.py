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
from recommendation.simple_module_call import get_best_transition_simple

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def transition_song(song_name: str):
    print(get_best_transition_simple(song_name))

@app.get('/api/search_song')
def search_song(query: str):
    song_name = find_and_download_song(query)
    get_best_transition_simple(song_name)