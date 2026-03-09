const fs = require('fs');

if (!fs.existsSync('people.csv')) {
  const key = process.env.HUB_AG3NTS_KEY;
  const url = `https://hub.ag3nts.org/data/${key}/people.csv`;
  fetch(url)
    .then(res => res.text())
    .then(text => fs.writeFileSync('people.csv', text));
}
