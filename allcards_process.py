import json, random
with open('allcards.json') as f:
    allcards = json.load(f)
    allnames = [card['name'] for set in allcards.values() for card in set if 'HERO' not in card['cardId']]
    existing = ['Molten Giant', 'Malygos', 'Lay on Hands']
    random.seed('dailycardgen')
    allnames = list(filter(lambda n: n not in existing, allnames))
    random.shuffle(allnames)
    allnames = existing + allnames
    with open('allnames.json', 'w') as g:
        json.dump(allnames, g)