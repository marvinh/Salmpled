
from math import remainder
import queue
import boto3
import os
import librosa
from dotenv import load_dotenv
import json
import numpy as np
from matplotlib.font_manager import json_dump, json_load
import requests
load_dotenv()

BUCKET = os.environ.get('BUCKET')
TEMPO_EXTRACT_QUEUE = os.environ.get('TEMPO_EXTRACT_QUEUE')
DOTNET_ENDPOINT = os.environ.get('DOTNET_ENDPOINT')

s3 = boto3.resource('s3')
data = []
#s3.meta.client.download_file(BUCKET, 'admin/admins super pack/9980050c-0b4b-4ab0-a328-cc6d3d761d86.mp3', '/tmp/extract.mp3')
tempfile = 'test4.mp3'
y , sr = librosa.load(tempfile,sr=32768*2)



tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=256, units='samples')

print(tempo)
