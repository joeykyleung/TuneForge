from os import environ

import requests
from flask import Flask, render_template, redirect, request, jsonify
from flask_caching import Cache

from db.DBClass import BorgDB
from db.DBQueries import fetch_microservice_url

from enum import Enum


class Microservices(Enum):
    NOTES_CONVERTER = "notes-converter"

# print(Microservices.NOTES_CONVERTER.value)

app = Flask(__name__)
config = {
    "DEBUG": False,
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 300
}
app.config.from_mapping(config)
cache = Cache(app)

dbConnection = BorgDB()
BorgDB.test_db_connection()


@app.route('/')
def home_page():
    return render_template("home_page.html")


@app.route('/clearcache', methods=["POST"])
def clearcache():
    password = request.values.get('password', '')
    if password != environ.get('CACHE_RESET_PWD', ''):
        return redirect('/', code=401)

    print("Clearing cache...")
    cache.clear()
    return redirect('/', code=200)

@app.route('/testms')
def testms():
    return redirect(fetch_microservice('dummy1'))

@app.route('/jsonmidi', methods=["POST"])
def json_to_midi():
    data = request.get_json()
    notes_converter_url = fetch_microservice(Microservices.NOTES_CONVERTER.value)
    notes_converter_endpoint = notes_converter_url + '/'
    response = requests.post(notes_converter_endpoint, json=data)
    if response.status_code == '200':
        #toDo: download
        pass
    else:
        #toDo: error
        return 'error'



@cache.memoize(1500)
def fetch_microservice(microservice):
    return fetch_microservice_url(microservice)

