import json
import re

# Load provinces JSON
with open("/home/apoptosis/Documents/SneakerHead_ITDBADM05/backend/src/db/inserts/ph_provinces.json", "r", encoding="utf-8") as f:
    provinces = json.load(f)  # expects format: [{"id": 1, "name": "Ilocos Norte"}, ...]

# Read cities/municipalities from TXT
cities_raw = []
with open("/home/apoptosis/Documents/SneakerHead_ITDBADM05/backend/src/db/inserts/cities.txt", "r", encoding="utf-8") as f:
    for line in f:
        # Use regex to extract ('City Name', province_id)
        match = re.search(r"\('(.+?)',\s*(\d+)\)", line.strip())
        if match:
            city_name = match.group(1)
            province_id = int(match.group(2))
            cities_raw.append((city_name, province_id))

# Transform into dict grouped by province_id with unique city IDs
cities = {}
city_id = 1
for name, province_id in cities_raw:
    if province_id not in cities:
        cities[province_id] = []
    cities[province_id].append({"id": city_id, "name": name})
    city_id += 1

# Combine provinces and cities
final_data = {
    "provinces": provinces,
    "cities": cities
}

# Write final JSON
with open("ph_locations.json", "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2, ensure_ascii=False)

print("✅ JSON file created: ph_locations.json")
