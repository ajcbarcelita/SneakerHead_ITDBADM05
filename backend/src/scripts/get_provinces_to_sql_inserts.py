import os
import requests
import json

API_URL = "https://psgc.gitlab.io/api/provinces/"

print("Fetching provinces from PSGC API...")
response = requests.get(API_URL)

if response.status_code != 200:
    raise Exception(f"Failed to fetch data: {response.status_code}")

provinces = response.json()
print(f"Fetched {len(provinces)} provinces.")

if not provinces:
    raise Exception("⚠️ No provinces returned from API.")

sql_lines = [
    "-- -----------------------------------------------------",
    "-- Inserts for table `sneakerhead`.`ref_ph_provinces`",
    "-- -----------------------------------------------------",
    "INSERT INTO `sneakerhead`.`ref_ph_provinces` (`province_id`, `province_name`) VALUES"
]

values = []
for idx, prov in enumerate(provinces, start=1):
    name = prov["name"].replace("'", "\\'")
    values.append(f"({idx}, '{name}')")

sql_lines.append(",\n".join(values) + ";")

output_path = os.path.join(os.getcwd(), "insert_provinces.sql")
print(f"💾 Writing output to: {output_path}")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print("✅ Done! File 'insert_provinces.sql' created successfully.")


