const d = require('../data/comprehensiveData');
const qtrs = new Set();
const lines = new Set();
const pos = new Set();
d.comprehensiveData.forEach(r => {
  qtrs.add(r.Quarter);
  lines.add(r.PromoLine);
  pos.add(r.Position);
});
const qArr = [...qtrs].sort();
console.log('Quarters:', JSON.stringify(qArr));
console.log('Total quarters:', qArr.length);
console.log('Years:', JSON.stringify([...new Set(qArr.map(q => q.split(' ')[1]))]));
console.log('PromoLines:', JSON.stringify([...lines]));
console.log('Positions:', JSON.stringify([...pos]));
console.log('Total records:', d.comprehensiveData.length);
