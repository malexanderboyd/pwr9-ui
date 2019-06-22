import pymongo
import os
import logging

MONGO_HOSTS = os.getenv('PWR9_MONGO_HOST', 'localhost')
MONGO_PORT = os.getenv('PWR9_MONGO_PORT', 27017)
MONGO_USER = os.getenv('PWR9_MONGO_USER')
MONGO_PASS = os.getenv('PWR9_MONGO_PW')

client = pymongo.MongoClient(f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOSTS}/test?retryWrites=true&w=majority")
db = client.test


logger = logging.getLogger('pwr9')
logger.setLevel(logging.DEBUG)

# create console handler and set level to debug
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

# create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# add formatter to ch
ch.setFormatter(formatter)

# add ch to logger
logger.addHandler(ch)