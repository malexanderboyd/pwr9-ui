import os
import json
import random
from dataclasses import dataclass
from enum import Enum
from typing import List


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


def get_deck_db():
    deck_db_path = os.path.join(os.getcwd(), 'db.json')

    if not os.path.exists(deck_db_path):
        raise RuntimeError(f'Unable to find deck database at {deck_db_path}')

    with open(deck_db_path, 'r') as deck_db_file:
        deck_db_raw = json.load(deck_db_file)
        return DeckDb(transform_deck_db_json(deck_db_raw))


deck_db = get_deck_db()
