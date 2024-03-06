import logging
import os

import requests
from flask import Flask, render_template, redirect, request, send_file, jsonify
from flask_caching import Cache

from db.DBClass import BorgDB
from db.DBQueries import fetch_microservice_url
from storage import azureStorage

from enum import Enum
import glob


class Microservices(Enum):
    NOTES_CONVERTER = 'notes-converter'
    WAVE_EXPORTER = 'wavexporter'
    SOUND_MOOD = 'soundmood'


downloads_folder = 'downloads/'
if not os.path.exists(downloads_folder):
    os.makedirs(downloads_folder)

app = Flask(__name__)
config = {
    'DEBUG': False,
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 300
}
app.config.from_mapping(config)
cache = Cache(app)
logging.basicConfig(level=logging.INFO)

dbConnection = BorgDB()
BorgDB.test_db_connection()


@app.route('/')
def home_page():
    remove_all_files(downloads_folder)
    return render_template('home_page.html')


@app.route('/clearcache', methods=['POST'])
def clearcache():
    password = request.values.get('password', '')
    if password != os.environ.get('CACHE_RESET_PWD', ''):
        return redirect('/', code=401)

    print('Clearing cache...')
    cache.clear()
    return redirect('/', code=200)


@app.errorhandler(404)
@app.errorhandler(500)
@app.errorhandler(504)
def error_page(e=None):
    # toDo: build error.html
    # return render_template("error.html", error=e)
    return 'error', 500


@app.route('/download', methods=["POST"])
def download_button():
    # data received is notes
    notes = request.get_json()
    notes_response = convert_notes_to_midi(notes)
    app.logger.info("Response:" + str(notes_response.status_code)
                    + " with text: " + notes_response.text)
    if notes_response.status_code != 201:
        return error_page()

    wav_response = get_wav_from_midi(notes_response.text)
    app.logger.info("Response:" + str(wav_response.status_code))
    if wav_response.status_code != 201:
        return error_page()
    wav_blob = wav_response.text

    local_wav = downloads_folder + wav_blob
    try:
        app.logger.info("trying to download to " + local_wav + " from " + wav_blob)
        azureStorage.download(local_wav, wav_blob)
    except Exception as e:
        app.logger.error(e)
        return 'File download error', 500
    # toDo: send to mood service and stuff
    app.logger.info("Finished everything except downloading. "+ local_wav)
    return send_file('../' + local_wav, as_attachment=True)


def convert_notes_to_midi(notes):
    notes_converter_url = fetch_microservice(
        Microservices.NOTES_CONVERTER.value)
    notes_converter_endpoint = notes_converter_url + '/'
    app.logger.info("Sending request to " + notes_converter_endpoint
                    + " with notes: " + str(notes))
    return requests.post(notes_converter_endpoint, json=notes)


def get_wav_from_midi(midi_blob):
    wavexporter_url = fetch_microservice_url(Microservices.WAVE_EXPORTER.value)
    wavexporter_endpoint = wavexporter_url + '/'
    midi_dict = {'midi' : midi_blob}

    app.logger.info('Sending request to ' + wavexporter_endpoint
                    + ' with midi blob: ' + str(midi_blob))
    return requests.post(wavexporter_endpoint, json=midi_dict)


@cache.memoize(1500)
def fetch_microservice(microservice):
    return fetch_microservice_url(microservice)


def remove_all_files(folder):
    files = glob.glob(os.curdir + '/' + folder + '*')
    for f in files:
        os.remove(f)
