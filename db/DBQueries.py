from db.DBClass import BorgDB


def fetch_microservice_url(microservice: str) -> str:
    url = BorgDB().get_data_from_db('dbQueries',
                                    'fetch_microservice',
                                    (microservice,))[0][0]
    print("DB Fetch for microservice: {microservice} \t returned URL: {URL}"
          .format(microservice=microservice, URL=url))
    return url
