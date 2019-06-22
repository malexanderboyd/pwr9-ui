from flask import Flask, render_template
from get_deck import deck_db, GameTypes

app = Flask(__name__)


@app.route('/')
def home():
    types = {
        'Standard': {'image': 'elves.png', 'color': 'border-success'},
        'Modern': {'image': 'modern.png', 'color': 'border-warning'},
        'Legacy': {'image': 'brainstorm.png', 'color': 'border-info'}
    }

    return render_template('home.html', game_types=types)


@app.route('/standard')
def standard():
    return render_template('deck.html', deck=deck_db.get_random_deck_by_type(GameTypes.STANDARD))


@app.route('/modern')
def modern():
    return render_template('deck.html', deck=deck_db.get_random_deck_by_type(GameTypes.MODERN))


@app.route('/legacy')
def legacy():
    return render_template('deck.html', deck=deck_db.get_random_deck_by_type(GameTypes.LEGACY))


@app.route('/regional')
def regional():
    return render_template('deck.html', deck=deck_db.get_random_deck_by_type(GameTypes.REGIONAL))


if __name__ == '__main__':
    app.run(debug=True)
