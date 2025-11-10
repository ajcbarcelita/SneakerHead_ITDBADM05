import fetch from "node-fetch";
import fs from "fs";

const BASE_URL = "https://psgc.gitlab.io/api";
const provincesDB = [
  [1, "Ilocos Norte"],
  [2, "Ilocos Sur"],
  d[(3, "La Union")],
  [4, "Pangasinan"],
  [5, "Batanes"],
  [6, "Cagayan"],
  [7, "Isabela"],
  [8, "Nueva Vizcaya"],
  [9, "Quirino"],
  [10, "Bataan"],
  [11, "Bulacan"],
  [12, "Nueva Ecija"],
  [13, "Pampanga"],
  [14, "Tarlac"],
  [15, "Zambales"],
  [16, "Aurora"],
  [17, "Batangas"],
  [18, "Cavite"],
  [19, "Laguna"],
  [20, "Quezon"],
  [21, "Rizal"],
  [22, "Marinduque"],
  [23, "Occidental Mindoro"],
  [24, "Oriental Mindoro"],
  [25, "Palawan"],
  [26, "Romblon"],
  [27, "Albay"],
  [28, "Camarines Norte"],
  [29, "Camarines Sur"],
  [30, "Catanduanes"],
  [31, "Masbate"],
  [32, "Sorsogon"],
  [33, "Aklan"],
  [34, "Antique"],
  [35, "Capiz"],
  [36, "Iloilo"],
  [37, "Negros Occidental"],
  [38, "Guimaras"],
  [39, "Bohol"],
  [40, "Cebu"],
  [41, "Negros Oriental"],
  [42, "Siquijor"],
  [43, "Eastern Samar"],
  [44, "Leyte"],
  [45, "Northern Samar"],
  [46, "Samar"],
  [47, "Southern Leyte"],
  [48, "Biliran"],
  [49, "Zamboanga Del Norte"],
  [50, "Zamboanga Del Sur"],
  [51, "Zamboanga Sibugay"],
  [52, "Bukidnon"],
  [53, "Camiguin"],
  [54, "Lanao Del Norte"],
  [55, "Misamis Occidental"],
  [56, "Misamis Oriental"],
  [57, "Davao Del Norte"],
  [58, "Davao Del Sur"],
  [59, "Davao Oriental"],
  [60, "Davao De Oro"],
  [61, "Davao Occidental"],
  [62, "Cotabato"],
  [63, "South Cotabato"],
  [64, "Sultan Kudarat"],
  [65, "Sarangani"],
  [66, "Abra"],
  [67, "Benguet"],
  [68, "Ifugao"],
  [69, "Kalinga"],
  [70, "Mountain Province"],
  [71, "Apayao"],
  [72, "Agusan Del Norte"],
  [73, "Agusan Del Sur"],
  [74, "Surigao Del Norte"],
  [75, "Surigao Del Sur"],
  [76, "Dinagat Islands"],
  [77, "Basilan"],
  [78, "Lanao Del Sur"],
  [79, "Maguindanao"],
  [80, "Sulu"],
  [81, "Tawi-Tawi"],
];

async function main() {
  const res = await fetch(`${BASE_URL}/provinces/`);
  const provinces = await res.json();

  const mapping = provincesDB.map(([province_id, dbName]) => {
    const match = provinces.find(
      (p) => p.name.toLowerCase().trim() === dbName.toLowerCase().trim(),
    );
    return { province_id, dbName, apiCode: match?.code };
  });

  const inserts = [];

  for (const { province_id, dbName, apiCode } of mapping) {
    if (!apiCode) {
      console.warn(`⚠️ No API match for ${dbName}`);
      continue;
    }

    const res = await fetch(`${BASE_URL}/provinces/${apiCode}/cities-municipalities/`);
    const citiesMunis = await res.json();

    for (const item of citiesMunis) {
      const name = item.name.replace(/'/g, "''"); // escape apostrophes
      inserts.push(`('${name}', ${province_id})`);
    }

    console.log(`✅ Processed ${dbName} (${citiesMunis.length} entries)`);
  }

  const sql = `
INSERT INTO ref_ph_cities (city_name, province_id)
VALUES
${inserts.join(",\n")};
`;

  fs.writeFileSync("insert_cities.sql", sql);
  console.log("💾 Saved SQL insert statements to insert_cities.sql");
}

main().catch(console.error);
