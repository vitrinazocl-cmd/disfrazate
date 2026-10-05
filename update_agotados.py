
import json
import re

sold_out_ids = [
    "DIS-0138", "DIS-0316", "DIS-0213", "DIS-0294", "DIS-0186",
    "DIS-0230", "DIS-0223", "DIS-0174", "DIS-0069", "DIS-0271",
    "DIS-0100", "DIS-0319", "DIS-0127", "DIS-0229", "DIS-0285",
    "DIS-0176", "DIS-0048", "DIS-0288"
]

with open("catalogo.js", "r", encoding="utf-8") as f:
    text = f.read()

# Extract the JSON array
match = re.search(r"const catalogoProductos = (\[.*\]);", text, re.DOTALL)
if not match:
    print("Could not find JSON array")
    exit(1)

json_str = match.group(1)
data = json.loads(json_str)

modified_count = 0
for prod in data:
    if prod.get("id") in sold_out_ids:
        prod["isSoldOut"] = True
        modified_count += 1
    else:
        prod["isSoldOut"] = False

# Convert back to JS
new_json_str = json.dumps(data, indent=4, ensure_ascii=False)
new_text = text[:match.start(1)] + new_json_str + text[match.end(1):]

with open("catalogo.js", "w", encoding="utf-8") as f:
    f.write(new_text)

print(f"Modified {modified_count} products.")
