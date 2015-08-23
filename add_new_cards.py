import json, random
import sys

with open('allnames.json') as f:
    existing_names = json.load(f)

with open('allcards.json') as f:
    allcards = json.load(f)
    allnames = [card['name'] for set in allcards.values() for card in set if 'HERO' not in card['cardId']]
    existing = existing_names[:int(sys.argv[1])]
    random.seed('dailycardgen')
    allnames = list(filter(lambda n: n not in existing, allnames))
    random.shuffle(allnames)
    allnames = existing + allnames
    with open('allnames.json.new', 'w') as g:
        json.dump(allnames, g)