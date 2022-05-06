import os
from essentia.standard import MonoLoader, TempoCNN
import csv
from kiwisolver import strength
import librosa
import numpy as np
#bash command to convert files
test_dir = "/Users/marvinharootoonyan/Salmpled/exctractEval/TestFolder"
dictionary = []
for filename in os.listdir(test_dir):
    f = os.path.join(test_dir, filename)
    key = os.path.splitext(filename)[0]
    type = os.path.splitext(filename)[1]
    librosa.cache.clear()
    if type == '.wav':
        NAME = key
        WAV_BYTES = os.path.getsize(f)
        y, sr = librosa.load(f,sr=44100)
        SECONDS = len(y)/sr
        y = y 
        tempo, beats = librosa.beat.beat_track(y=y, sr=44100, hop_length=441)
        LIBROSA = round(tempo,4)
        audio = MonoLoader(filename=f, sampleRate=44100)()
        audio = audio
        model = TempoCNN(graphFilename="deepsquare-k16-3.pb")
        global_tempo, local_tempo, local_tempo_probabilities = model(audio)
        print(local_tempo)
        TEMPO_CNN = global_tempo
        dictionary.append({
            'name': NAME, 
            'tempo_cnn': TEMPO_CNN, 
            'librosa': LIBROSA, 
            'wav_bytes': WAV_BYTES, 
            'seconds': round(SECONDS,2),
        })
    elif type == '.mp3':
        print('will add info in second iteration')
        # NAME = key
        # MP3_BYTES = 
        # dictionary[NAME] = {
        #     'mp3_bytes': MP3_BYTES
        # }

for filename in os.listdir(test_dir):
    f = os.path.join(test_dir, filename)
    key = os.path.splitext(filename)[0]
    type = os.path.splitext(filename)[1]
    
    if type == '.wav':
        print('do nothing')
    elif type == '.mp3':
        for i in dictionary:
            if i['name'] == key:
                i['mp3_bytes'] = os.path.getsize(f)
                


print(dictionary)

for i in dictionary:
    i["comp_ratio"] = i["wav_bytes"]/i['mp3_bytes']
    

with open('TEMPO_EXTRACT.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=['name', 'seconds', 'librosa', 'tempo_cnn','wav_bytes', 'mp3_bytes','comp_ratio'])
    writer.writeheader()
    writer.writerows(dictionary)







