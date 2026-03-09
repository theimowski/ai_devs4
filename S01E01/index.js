const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const USE_CALENDAR_YEAR_ONLY = true; // Set to false for full date comparison

const filename = 'people.csv';
const key = process.env.HUB_AG3NTS_KEY;
const url = `https://hub.ag3nts.org/data/${key}/${filename}`;
const REFERENCE_DATE = new Date('2026-03-09'); // Reference date is today

(async () => {
  if (!fs.existsSync(filename)) {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync(filename, text);
  }

  const content = fs.readFileSync(filename, 'utf-8');
  
  // Parse CSV into an array of objects
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });

  // Apply filters
  const filtered = records.filter(row => {
    const isMan = row.gender === 'M';
    const isFromGrudziadz = row.birthPlace === 'Grudziądz';
    
    let age;
    if (USE_CALENDAR_YEAR_ONLY) {
      const birthYear = parseInt(row.birthDate?.split('-')[0]);
      age = 2026 - birthYear;
    } else {
      const birthDate = new Date(row.birthDate);
      age = REFERENCE_DATE.getFullYear() - birthDate.getFullYear();
      const monthDiff = REFERENCE_DATE.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && REFERENCE_DATE.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const isAgeCorrect = age >= 20 && age <= 40;
    return isMan && isFromGrudziadz && isAgeCorrect;
  });

  // Convert objects back to CSV and save
  const output = stringify(filtered, {
    header: true
  });

  fs.writeFileSync('filtered.csv', output);
})();
