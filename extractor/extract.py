# import librosa

# y, sr = librosa.load('/Users/marvinharootoonyan/Salmpled/extractor/read.mp3',sr=44100)

# tempo = librosa.beat.tempo(y=y, sr=sr, hop_length=441,ac_size=1)

# print(tempo[0])

import queue
import boto3
import os
import librosa
from dotenv import load_dotenv
import json

from matplotlib.font_manager import json_dump, json_load
import requests

load_dotenv()

BUCKET = os.environ.get('BUCKET')
TEMPO_EXTRACT_QUEUE = os.environ.get('TEMPO_EXTRACT_QUEUE')
DOTNET_ENDPOINT = os.environ.get('DOTNET_ENDPOINT')

s3 = boto3.resource('s3')
sqs = boto3.client('sqs')

queue_url = TEMPO_EXTRACT_QUEUE

print(BUCKET)
print(TEMPO_EXTRACT_QUEUE)

response = sqs.receive_message(
    QueueUrl=queue_url,
    AttributeNames=[
        'SentTimestamp'
    ],
    MaxNumberOfMessages=1,
    MessageAttributeNames=[
        'All'
    ],
    VisibilityTimeout=0,
    WaitTimeSeconds=0
)

message = response['Messages'][0]
receipt_handle = message['ReceiptHandle']

body = message['Body']

mp3Keys = json.loads(body)['mp3Keys']

print(mp3Keys)

data = []
for mp3 in mp3Keys:
    s3.meta.client.download_file(BUCKET, mp3, '/tmp/extract.mp3')
    tempfile = '/tmp/extract.mp3'
    y, sr = librosa.load(tempfile,sr=44100)
    tempo = librosa.beat.tempo(y=y, sr=sr, hop_length=441,ac_size=(len(y)/sr)/2.0)[0]
    data.append({'CKey': mp3, 'Tempo': tempo})

headers={
    'Content-type':'application/json', 
    'Accept':'application/json'
}

data = {'list': data}

url = DOTNET_ENDPOINT
print(json.dumps(data))
print(url)
x = requests.post(url, json=data, verify=False)



sqs.delete_message(
    QueueUrl=queue_url,
    ReceiptHandle=receipt_handle
)






