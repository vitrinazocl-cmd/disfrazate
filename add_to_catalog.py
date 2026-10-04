
import json
import re

data = """DIS-0310	LUIGI	10	NIÑO	7000
DIS-0311	MORTAL COMBALL	4	NIÑO	7000
DIS-0312	NINJA	10	NIÑO	7000
DIS-0313	BRUJA	12	NIÑA	7000
DIS-0314	FORNITE AMARILLO	S	HOMBRE	7000
DIS-0315	LOS INCREIBLES	6	NIÑA	7000
DIS-0316	EL EXTRAÑO MUNDO DE JACK	6	NIÑO	8000
DIS-0317	DINOSAURIO	4	NIÑO	5000
DIS-0318	PIKACHU	10	NIÑO	5000
DIS-0319	SPIDERMAN	8	NIÑO	6000
DIS-0320	SONIC AMARILLO	8	NIÑO	5000
DIS-0321	BEETLEJUICE	XL	MUJER	10000
DIS-0322	MAGO	6	NIÑO	5000
DIS-0323	STARWARS	4	NIÑO	6000
DIS-0324	PAW CONTROL	3	NIÑO	5000
DIS-0325	TRAJE NEGRO	8	NIÑO	7000
DIS-0326	PONCHO	M	MUJER	7000
DIS-0327	DINOSAURIO	2	NIÑO	6000
DIS-0328	CAPA NEGRA	M	HOMBRE	7000"""

new_products = []
for line in data.strip().split("\n"):
    parts = line.split("\t")
    if len(parts) == 5:
        p_id = parts[0].strip()
        name = parts[1].strip()
        size = parts[2].strip()
        category = parts[3].strip()
        price = int(parts[4].strip())
        
        prod = {
            "id": p_id,
            "name": name,
            "price": price,
            "category": category,
            "image": f"catalogo 4_procesadas/{p_id}_catalog.jpg",
            "highResImage": f"catalogo 4_procesadas/{p_id}_catalog.jpg",
            "sizes": [size],
            "isOffer": False,
            "isNew": True,
            "isBestseller": False
        }
        new_products.append(prod)

# Read catalogo.js
with open("catalogo.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find the end of the array
end_idx = content.rfind("];")

# Build the string to insert
insert_str = ""
for prod in new_products:
    prod_json = json.dumps(prod, ensure_ascii=False, indent=4)
    # properly indent
    prod_json = "\n".join("    " + line for line in prod_json.split("\n"))
    insert_str += ",\n" + prod_json

# Insert
new_content = content[:end_idx].rstrip() + insert_str + "\n];\n"

with open("catalogo.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Added {len(new_products)} products.")
