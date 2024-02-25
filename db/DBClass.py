import configparser
import os

import psycopg as db


class BorgDB:
    _shared_state = {}

    # This attribute will be shared among all instances
    # enforces singleton for DB connection

    def __init__(self):
        self.__dict__ = self._shared_state
        self._initialise_connection()

    def __del__(self):
        if "DBConnection" in self._shared_state:
            self._shared_state["DBConnection"].close()
            del self._shared_state["DBConnection"]

    def _initialise_connection(self) -> bool:
        if "DBConnection" not in self._shared_state:
            try:
                config = configparser.ConfigParser()
                config.read("db/db_details.ini")
                config["connection"]["user"] = os.environ.get("DB_USR")
                config["connection"]["password"] = os.environ.get("DB_PWD")
                conn = db.connect(**config["connection"])
                curs = conn.cursor()
                curs.execute(config["dbQueries"]["validation"])
                rec = curs.fetchone()
                if rec[0] != "First trial":
                    raise Exception("DB connection validation failed.")
                self._shared_state["DBConnection"] = conn
                return True
            except Exception as e:
                print("DB connection failed. Will retry next time")
                print(e)
            return False
        return True

    # initializes new connection if previous tries had failed
    def get_connection(self):
        if "DBConnection" in self._shared_state:
            return self._shared_state["DBConnection"]
        else:
            if self._initialise_connection():
                return self._shared_state["DBConnection"]
            else:
                raise ConnectionAbortedError("DB connection failed.")

    def get_data_from_db(self, query_type, query, params=None):
        config = configparser.ConfigParser()
        config.read("db/db_details.ini")
        conn = self.get_connection()
        curs = conn.cursor()
        if not params:
            curs.execute(config[query_type][query])
        else:
            curs.execute(config[query_type][query], params)

        return curs.fetchall()

    @staticmethod
    def test_db_connection():
        try:
            BorgDB().get_connection()
            print("DB connected")
        except Exception as e:
            print(e)
            print("DB connection failed.")


if __name__ == "__main__":
    s1 = BorgDB()
    s2 = BorgDB()

    conn1 = s1.get_connection()
    conn2 = s2.get_connection()

    if id(conn1) == id(conn2):
        print("Singleton works, only one DB connection instantiated.")
    else:
        print("Singleton failed, multiple connections were opened to the DB.")
