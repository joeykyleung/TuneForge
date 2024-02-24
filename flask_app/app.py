from flask import Flask, render_template

from db.DBClass import BorgDB

app = Flask(__name__)


dbConnection = BorgDB()


def test_db_connection():
    try:
        dbConnection.get_connection()
        print("DB connected")
    except Exception as e:
        print(e)
        print("DB connection failed.")


test_db_connection()

@app.route('/')
def index():  # put application's code here
    return render_template("index.html")


if __name__ == '__main__':
    app.run()
