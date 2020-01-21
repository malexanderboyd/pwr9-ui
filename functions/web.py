import re
from contextlib import closing
import socket

from celery import Celery

import pathlib
import filecmp

from flask import Flask, jsonify, request, abort

from flask_cors import CORS
import redis
import os
import json
import secrets


def make_celery(flask_app):
    c = Celery(
        flask_app.import_name,
        backend=flask_app.config['CELERY_RESULT_BACKEND'],
        broker=flask_app.config['CELERY_BROKER_URL']
    )
    c.conf.update(flask_app.config)

    class ContextTask(c.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)

    c.Task = ContextTask
    return c


def make_app():
    flask_app = Flask(__name__)
    flask_app.config.update(
        CELERY_BROKER_URL='redis://localhost:6379',
        CELERY_RESULT_BACKEND='redis://localhost:6379'
    )
    return flask_app


app = make_app()
CORS(app)
celery_ins = make_celery(app)

cache_host = 'redis' if os.getenv('ENV') == 'docker' else 'localhost'
cache = redis.StrictRedis(host=cache_host, port=6379)


@celery_ins.task(name='store_json_for_later')
def store_json_for_later(filename, content):
    check_duplicate = False
    path = pathlib.Path('./data')

    if os.path.exists(path.joinpath(filename)):
        filename += '-new'
        check_duplicate = True

    with open(path.joinpath(filename), 'w') as stored_file:
        json.dump(content, stored_file)

    if check_duplicate:
        if filecmp.cmp(path.joinpath(filename), path.joinpath(filename[:-4])) is True:
            os.remove(path.joinpath(filename))


@app.route('/cubes')
def cubes():
    try:
        cached_cubes = cache.get("cubes")
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

    if not cached_cubes:
        cubes_backup = pathlib.Path('data').joinpath('cubes.json')
        if os.path.exists(cubes_backup):
            with open(cubes_backup, 'r') as set_backup_file:
                return jsonify(json.load(set_backup_file))
    else:
        cubes = json.loads(cached_cubes.decode("utf-8"))

        store_json_for_later.delay('cubes.json', cubes)

        return jsonify(cubes)


@app.route('/sets')
def sets():
    try:
        cached_sets = cache.get("sets")
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

    if not cached_sets:
        sets_backup = pathlib.Path('data').joinpath('sets.json')
        if os.path.exists(sets_backup):
            with open(sets_backup, 'r') as set_backup_file:
                return jsonify(json.load(set_backup_file))
    else:
        set_blocks = json.loads(cached_sets.decode("utf-8"))

        store_json_for_later.delay('sets.json', set_blocks)

        return jsonify(set_blocks)


@app.route('/game/<string:game_id>')
def game_info(game_id):
    try:
        cached_game_options = cache.get(f"game_{game_id}")
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

    if cached_game_options is None:
        return jsonify({})

    game_options = json.loads(cached_game_options.decode("utf-8"))

    store_json_for_later.delay(f'game_{game_id}.json', game_options)

    return jsonify(game_options)


def store_game_info(game_id, game_port, game_options):
    game_options["port"] = game_port
    try:
        cache.set(f"game_{game_id}", json.dumps(game_options))
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


@app.route('/game', methods=['POST'])
def create_game():
    if request.is_json:
        game_options = request.get_json()
        print(f"Starting new game: {game_options}")
        game_id = secrets.token_urlsafe(4)
        game_port = find_available_port()
        if start_game(game_id, game_port, game_options):
            store_game_info(game_id, game_port, game_options)
        return jsonify(dict(url=f"/draft/g/{game_id}"))
    else:
        abort(400, "Must send JSON")


def start_game(game_id, game_port, game_options):
    if os.getenv("ENV") == "dev":
        import docker
        client = docker.from_env()

        container_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', game_options.get('gameTitle'))
        container = client.containers.run("pwr9/godr4ft", f"/main -port={game_port} -gameId={game_id}",
                                          ports={f'{game_port}/tcp': game_port},
                                          name=container_name, detach=True)
        while container.status != "running":
            container.reload()
            if container.status == 'exited':
                break
            pass
        if container.status == 'exited':
            return False
        return True


def find_available_port():
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


if __name__ == "__main__":
    # store_game_info("abc321", "8123", dict(
    #     gameTitle="A Sample Game",
    #     gameType=1,
    #     gameMode=1,
    # ))
    app.run(host="0.0.0.0", port=os.getenv("PORT", 8000))