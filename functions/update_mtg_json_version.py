import io
import pathlib
import zipfile
from collections import defaultdict

import requests
import os
import json
import datetime
from dataclasses import dataclass, asdict, field
import redis

cache_host = 'redis' if os.getenv('ENV') == 'docker' else 'localhost'
cache = redis.StrictRedis(host=cache_host, port=6379)


@dataclass
class MTGJSONVersion:
    date: str  # When all files were last completely built. (All data is updated)
    pricesDate: str  # When card prices were updated on cards. (Prices data is updated)
    version: str  # What version all files are on. (Updates with pricesDate)


@dataclass
class PWR9Version:
    server: str
    client: str
    mtg_json: MTGJSONVersion = field(default_factory=MTGJSONVersion)


def get_version():
    try:
        res = requests.get(MTGJSON.VERSION_URL)
        if res.ok:
            response = MTGJSONVersion(**res.json())
            return response
    except (requests.exceptions.Timeout, requests.exceptions.RetryError):
        print(f'MTGJSON timed out; will try again tomorrow')
    except Exception as e:
        print(e)
    return None


def get_cached_version():
    try:
        cached_version = cache.get("version")
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

    if not cached_version:
        return None

    try:
        version_info = json.loads(cached_version.decode("utf-8"))
        return PWR9Version(mtg_json=MTGJSONVersion(**version_info.get('mtg_json', {})),
                           client=version_info.get('client'), server=version_info.get('server'))
    except json.JSONDecodeError:
        print(f'Error decoding cached redis json: {cached_version.decode("utf-8")}')
        return None
    except Exception as e:
        print(f'exception during version retrieval: {e}')
        return None


@dataclass
class MTGJSON:
    BASE_URL: str = "https://api.magicthegathering.io/v1"
    VERSION_URL: str = f"{BASE_URL}/files/version.json"
    SETS_URL: str = f"{BASE_URL}/sets"
    BOOSTER_GEN_URL: str = f"{BASE_URL}/sets/{{set_id}}/booster"


PWR9 = dict(
    BASE_URL="http://librajobs.org",
    REDIS_URL="http://somerandomredis.org"
)


def update_to_mtg_json_version(version: MTGJSONVersion):
    server_version = "0.1.0"  # TODO: reach out to server for version
    client_version = "0.1.0"  # TODO: reach out to client for version

    new_version = PWR9Version(mtg_json=version, server=server_version, client=client_version)

    try:
        cache.set("version", json.dumps(asdict(new_version)))
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


# mtg_version = get_version()
#
# print(mtg_version)
# print()
#
# cached_version = get_cached_version()


def download_new_mtg_sets():
    try:
        res = requests.get(MTGJSON.SETS_URL)
        if res.ok:
            sets = res.json()
            set_blocks = defaultdict(list)
            for set in sets.get('sets', []):

                block = set.get('block')
                if block:
                    set_blocks[block].append(set)
            return {block: [dict(name=set.get('name'), id=set.get('code')) for set in set_blocks[block]] for block in
                    set_blocks}
            # sets_zip = zipfile.ZipFile(io.BytesIO(res.content))
            # return {name: sets_zip.read(name) for name in sets_zip.namelist()}
    except (requests.exceptions.Timeout, requests.exceptions.RetryError):
        print(f'MTGJSON timed out; will try again tomorrow')
    except Exception as e:
        print(e)
    return None


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


# mtg_set_data = download_new_mtg_sets()
# cache_data('sets', mtg_set_data)

with open(pathlib.Path('data').joinpath('cubes.json'), 'r') as cubes_file:
    cache_data('cubes', json.load(cubes_file))
