
import json
with open("catalogo.js", "r", encoding="utf-8") as f:
    text = f.read()
start = text.find("[")
end = text.rfind("]") + 1
data = json.loads(text[start:end])

for item in data:
    try:
        id_num = int(item["id"].split("-")[1])
        if 42 <= id_num <= 50:
            print(item["id"], item["name"], item["category"])
    except:
        pass
