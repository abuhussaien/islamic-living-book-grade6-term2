// No install step or third-party dependency required.
const fs = require('node:fs');
const lessons = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
fs.writeFileSync('data.js', 'window.LESSONS = ' + JSON.stringify(lessons) + ';\n');
for (const [key, subject] of Object.entries({tawheed:'التوحيد', hadith:'الحديث والسيرة', fiqh:'الفقه'})) {
  fs.writeFileSync(key + '.json', JSON.stringify(lessons.filter(l => l.subject === subject), null, 2) + '\n');
}
console.log('Built ' + lessons.length + ' lessons from catalog.json');
