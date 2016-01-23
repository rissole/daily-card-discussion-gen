import re, json

def generate_hh_ids(cards_xml_path):
    with open(cards_xml_path) as f:
        xml = f.read()
        matches = re.findall(r'<Field column="ID">(.*?)</Field>.*?<Field column="NOTE_MINI_GUID">(.*?)</Field>', xml, re.DOTALL)
        with open('hh_ids.json', 'w') as g:
            json.dump({match[1] : match[0] for match in matches}, g)

if __name__=="__main__":
    import sys
    generate_hh_ids(sys.argv[1])