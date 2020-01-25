import pathlib
from collections import defaultdict

import redis
import os
import json
import requests
from datetime import datetime


cache_host = 'redis' if os.getenv('ENV') == 'docker' else 'localhost'
cache = redis.StrictRedis(host=cache_host, port=6379)

def cache_data(key: str, json_data: dict):
    try:
        cache.set(key, json.dumps(json_data))
        print(f'Updated {key} cache')
    except (redis.exceptions.TimeoutError, redis.exceptions.ConnectionError) as ce:
        print(f'error connecting to cache: {ce}')
        return None
    except redis.exceptions.AuthenticationError as ae:
        print(f'unable to authenticate with cache: {ae}')
        return None
    except redis.exceptions.RedisError as re:
        print(f'redis error: {re}')
        return None
    except Exception as e:
        print(f'exception during version retrieval: {e}')
        return None
    finally:
        cache.close()

res = requests.get('https://archive.scryfall.com/json/scryfall-default-cards.json')

latest_cards = res.json()

cards_by_set = defaultdict(list)

for card in latest_cards:
    cards_by_set[card.get('set')].append(card)

for set, cards in cards_by_set.items():
    cache_data(f'set_{set}', cards)

cache_data(f'sets', [set_abbrev for set_abbrev in cards_by_set.keys()])

with open(pathlib.Path('data').joinpath(f'sets-{datetime.now().isoformat()}.json'), 'w') as sets_file:
    sets_file.write(json.dumps(cards_by_set))

print('Warmed!')