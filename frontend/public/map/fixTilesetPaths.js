const fs = require('fs');
const path = require('path');

// Die Datei im "map"-Ordner
const originalFile = path.join(__dirname, 'WebArenaMap.json');
const backupFile = path.join(__dirname, 'WebArenaMap_backup.json');
const folderName = 'Kachelsafe';

try {
    // Backup
    fs.copyFileSync(originalFile, backupFile);
    console.log(`✅ Backup erstellt: ${backupFile}`);

    // Einlesen
    const mapData = JSON.parse(fs.readFileSync(originalFile, 'utf8'));

    // Tilesets anpassen
    if (Array.isArray(mapData.tilesets)) {
        mapData.tilesets.forEach(ts => {
            if (ts.image) {
                const filename = path.basename(ts.image);
                ts.image = `${folderName}/${filename}`;
            }
        });

        // Zurückschreiben
        fs.writeFileSync(originalFile, JSON.stringify(mapData, null, 2), 'utf8');
        console.log('✅ Tileset-Image-Pfade aktualisiert.');
    } else {
        console.error('❌ Keine gültigen Tilesets gefunden.');
    }
} catch (err) {
    console.error('❌ Fehler beim Verarbeiten:', err.message);
}