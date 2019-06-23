import dataclasses
import os
import json
import random
import secrets
from dataclasses import dataclass
from enum import Enum
from typing import List

from util import db, logger

USE_BACKUP = os.getenv('pwr_use_backup', False)


class GameTypes(Enum):
    STANDARD = 'standard'
    MODERN = 'modern'
    LEGACY = 'legacy'
    REGIONAL = 'regional'


@dataclass
class Deck:
    name: str
    placed: str
    player: str
    contents: str
    id: str = dataclasses.field(default_factory=secrets.token_urlsafe)


@dataclass
class Tournament:
    name: str
    decks: List[Deck]


@dataclass
class GameType:
    name: str
    tournaments: List[Tournament]

    def get_random_deck(self):
        tournament = random.choice(self.tournaments)

        tries = 0

        while tries < 10:
            deck = random.choice(tournament.decks)
            if deck:
                return deck
            tries += 1
        raise RuntimeError(f'Unable to provide random deck from {self.name}')


@dataclass
class DeckDb:
    types: dict

    def get_random_deck(self):
        return self._get_random_deck_all_types()

    def get_random_deck_by_type(self, selected_type: GameTypes):
        if selected_type.value not in self.types:
            raise RuntimeError(f'{selected_type} not in deck db.')

        selected_type = selected_type.value

        game_type = self.types[selected_type]

        return game_type.get_random_deck()

    def _get_random_deck_all_types(self):
        game_type = random.choice(list(self.types.keys()))
        return self.types[game_type].get_random_deck()

    def to_json(self):
        if not self.types:
            return {}

        game_types = {}
        for game_type_name in self.types:
            tournaments_dict = {}
            game_type = self.types[game_type_name]
            tournaments = game_type.tournaments
            for tournament in tournaments:
                tournaments_dict[tournament.name] = {deck.name: list(dataclasses.astuple(deck)) for deck in
                                                     tournament.decks}
            game_types[game_type_name] = tournaments_dict

        return game_types


def transform_deck_db_json(contents: dict):
    if not contents:
        return contents

    game_types = {}
    for game_type in contents:
        tournaments = []
        events = contents[game_type]
        for event in events:
            tournaments.append(
                Tournament(event, [Deck(*contents) for deck, contents in events[event].items()])
            )
        game_types[game_type.lower()] = GameType(game_type.lower(), tournaments)

    return game_types


def _get_from_backup_db():
    deck_db_path = os.path.join(os.getcwd(), 'db.json')

    if not os.path.exists(deck_db_path):
        raise RuntimeError(f'Unable to find deck database at {deck_db_path}')

    with open(deck_db_path, 'r') as deck_db_file:
        deck_db_raw = json.load(deck_db_file)
        return DeckDb(transform_deck_db_json(deck_db_raw))


def get_deck_db(from_backup=False):
    if from_backup:
        backup_db = _get_from_backup_db()
        for game_type, content in backup_db.to_json().items():
            try:
                db.game_types.update_one({'type': game_type}, {'$set': {'data': {game_type: content}}})
            except Exception as e:
                logger.exception(e)
                pass
        return backup_db

    raw_db = db.game_types.find()
    contents = {}
    for item in raw_db:
        game_type = item.get('type')
        contents[game_type] = item.get('data', {}).get(game_type)
    game_types = transform_deck_db_json(contents)
    return DeckDb(game_types)


try:
    deck_db = get_deck_db(from_backup=True)
except Exception as e:
    logger.exception(e)
    raise e
