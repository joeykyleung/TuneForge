from os import environ

from flask import Flask, render_template, redirect, request, jsonify
from flask_caching import Cache

from db.DBClass import BorgDB
from db.DBQueries import fetch_microservice_url

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


@cache.memoize(1500)
def fetch_microservice(microservice):
    return fetch_microservice_url(microservice)

