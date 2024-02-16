from flask import Flask

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
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
