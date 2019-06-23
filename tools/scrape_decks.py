import json
import re
import os
from collections import defaultdict

import requests
from bs4 import BeautifulSoup, Tag


RECENT_LEGACY_DECKS_URL = 'http://www.starcitygames.com/decks/results/format/3/start_date/31-03-2019/end_date/23-06-2019/w_perc/0/g_perc/0/r_perc/0/b_perc/0/u_perc/0/a_perc/0/order_1/finish/limit/100/start_num/0/'
RECENT_STANDARD_DECKS_URL = 'http://www.starcitygames.com/decks/results/format/1/start_date/31-03-2019/end_date/23-06-2019/w_perc/0/g_perc/0/r_perc/0/b_perc/0/u_perc/0/a_perc/0/order_1/finish/limit/100/start_num/0/'
RECENT_MODERN_DECKS_URL = 'http://www.starcitygames.com/decks/results/format/28/start_date/31-03-2019/end_date/23-06-2019/w_perc/0/g_perc/0/r_perc/0/b_perc/0/u_perc/0/a_perc/0/order_1/finish/limit/100/start_num/0/'

SCRAPE_BASE = os.getenv('pwr_scrape_base')
if not SCRAPE_BASE:
    raise RuntimeError(f'Must provide a valid scrape base url. current: {SCRAPE_BASE}')

SCRAPE_DEST = f'{SCRAPE_BASE}/content/decklists'

res = requests.get(SCRAPE_DEST)

res.raise_for_status()

soup = BeautifulSoup(res.text, features="html.parser")

deck_lists = soup.find_all("div", class_="decklist")
all_types = []

deck_list_links = defaultdict(list)

for deck_list in deck_lists:

    descendants = [d for d in deck_list.descendants if d]

    type = next(
        tag for tag in descendants if hasattr(tag, 'attrs') and 'decklist-top' in tag.attrs.get('class', [])).text

    links = (tag for tag in descendants if hasattr(tag, 'attrs') and 'decklist-links' in tag.attrs.get('class', []))
    for link in links:
        tournament_html_links = [tournament_link.next for tournament_link in link.contents if
                                 isinstance(tournament_link, Tag) and tournament_link.next and isinstance(
                                     tournament_link.next, Tag)]
        tournament_links = [(link.text, link.attrs.get('href')) for link in tournament_html_links if
                            link and link.text and link.attrs and link.attrs.get('href')]
        deck_list_links[type].extend(
            tournament_links
        )

all_decks = {}
for game_type, lists in deck_list_links.items():
    tournaments = {}
    db_links = {
        'standard': RECENT_STANDARD_DECKS_URL,
        'legacy': RECENT_LEGACY_DECKS_URL,
        'modern': RECENT_MODERN_DECKS_URL
    }
    additonal_link = db_links.get(game_type.lower())
    if additonal_link:
        lists.append(('Additional', additonal_link))
    for tournament_name, link in lists:
        decks_html = requests.get(link)
        deck_content = BeautifulSoup(decks_html.text, features="html.parser")

        decks_headers = deck_content.find_all('td', class_=['deckdbbody', 'deckdbbody2'])

        have_descendants = [d.descendants for d in decks_headers if d and hasattr(d, 'descendants')]

        descendants = [d for d in have_descendants if d]

        decks = {}
        deck_links = []
        for descendant_tags in descendants:
            for tag in descendant_tags:
                if hasattr(tag, 'attrs') and '/decks/' in tag.attrs.get('href', []):
                    deck_links.append(
                        tag.attrs.get('href')
                    )

        deck_link_regex = re.compile(r'/decks/(\d+)')
        deck_links = list(filter(deck_link_regex.search, deck_links))

        for deck_link in deck_links:
            deck_id = deck_link_regex.search(deck_link).group(1)
            download_url = f'{SCRAPE_BASE}/decks/download_deck'

            deck_info_url = f'{SCRAPE_BASE}/decks/{deck_id}'

            deck_info_res = requests.get(deck_info_url)

            deck_info_soup = BeautifulSoup(deck_info_res.text, features="html.parser")

            deck_name = deck_info_soup.find_all('header', class_='deck_title')[0].text
            deck_placed = deck_info_soup.find_all('header', class_='deck_played_placed')[0].text
            deck_player = deck_info_soup.find_all('header', class_='player_name')[0].text

            deck_contents = requests.get(download_url, params={'DeckID': deck_id, 'Mode': 'modo'})

            decks[deck_name] = (deck_name, deck_placed, deck_player, deck_contents.text)
        tournaments[tournament_name] = decks
    all_decks[game_type] = tournaments

print(all_decks)

with open('new_db.json', 'w') as file:
    file.write(json.dumps(all_decks))