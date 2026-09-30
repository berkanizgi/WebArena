# WebArena: Solo-Vorschau

## Stand und Architektur

Ausgangspunkt ist der öffentliche Branch `main-final`, Commit `723d273` (»local eingestellt«).
Der bestehende Code verwendet weiterhin feste `localhost`-Adressen für vier Spring-Boot-Dienste:
GameService (8081), CharacterService (8084), MapService (8080), ShopService (8083).
Auch die ursprünglichen Einzelspieler-Level hängen an diesen Diensten. Die Java-Dienste
erwarten PostgreSQL und vordefinierte Charakterdatensätze; ein vollständiger Seed-/Migrationsablauf
liegt nicht bei. `LEVEL_3.ts` ist leer, die referenzierte NPC-Grafik `enemy_walk.png` fehlt.

Die neue Startseite lädt deshalb eine eigene Phaser-Szene, die komplett im Browser läuft.
Die ursprünglichen Multiplayer-Seiten und Java-Services bleiben erhalten. Die Solo-Vorschau
ruft sie nicht auf. Ein späterer Mehrspielerbetrieb erfordert weiterhin Backend-Arbeit.

## Umsetzung

- `frontend/src/components/arena/`: Startseite, Figurenauswahl, HUD, Hilfe, Pause, Ergebnis und Touch-Tasten.
- `frontend/src/solo/SoloScene.ts`: Phaser-Karte, Kollisionen, Gegner, Projektile und Rundenablauf.
- `frontend/src/solo/rules.ts`: Charakterwerte, Wegfindung, erreichbare Startpunkte und lokale Speicherung.
- `frontend/tests/solo.test.mjs`: Tests der Bewegungs- und Wegfindungsregeln sowie beschädigter Speicherdaten.
- Originalkarte `WebArenaMap.json`, vorhandene Sprites, Lobbybilder und Gegenstände werden wiederverwendet.
- Vier Kämpfer mit unterschiedlichen Lebens-, Tempo- und Angriffswerten; drei Wellen mit 3, 4 und 5 Gegnern.
- Training ohne Schaden, Sieg/Niederlage, Neustart, Pause und automatische Pause bei Fokusverlust.
- Bestwert und Siege liegen ausschliesslich im Browser (`webarena.solo.progress.v1`), ohne Account oder Server.

Die in Tiled gespeicherte Editor-Sichtbarkeit wird beim Laden aufgehoben; doppelte Tileset-Namen
erhalten zur Laufzeit eindeutige Schlüssel. Gegner und Gegenstände starten auf vom Spieler
erreichbaren Bodenfeldern. Projektile verschwinden an Wänden, Treffer erzeugen sichtbares Feedback.

Die TypeScript-Eingaben umfassen jetzt nur Quellcode und Next-Typen. `.tsx`-Dateien im Kartenordner
sind Tiled-XML und wurden zuvor fälschlich als React-Code geprüft. Die alte `/map`-Route führt
jetzt zur spielbaren Startseite. Ein bestehender Sichtbarkeitsfehler bei `tutorialArrow` wurde behoben.

## Lokal starten und prüfen

Node.js 24 LTS verwenden, dann im Ordner `frontend`:

```bash
npm ci
npm run preview
npm run test:solo
npm run check:solo
```

Die Vorschau läuft auf `http://127.0.0.1:3100`. `PORT` kann einen anderen Port festlegen.
`scripts/preview.mjs` startet Next direkt in einem Prozess, weil der übliche Next-Dev-Launcher
in der eingeschränkten Windows-Umgebung mit `spawn EPERM` scheitert.
Der Preview-Cache `.next-preview` bleibt vom normalen Produktionscache getrennt.

Steuerung: WASD/Pfeiltasten bewegen, Maus zielen, Linksklick oder Leertaste schiessen,
Escape pausieren/fortsetzen. Touch-Geräte haben Richtungstasten und einen Schussknopf,
der auf den nächsten Gegner zielt. Für Treffer muss die Schussbahn frei sein.

## Prüfprotokoll der lokalen Vorschau

- Alle vier automatisierten Tests bestanden, vollständige TypeScript-Prüfung und Lint des Solo-Codes bestanden.
- Training mit Bewegung, gezielten Mausschüssen, drei Übungsgegnern und Tempo-Boost bis zum Abschluss gespielt.
- Arena mit allen drei Wellen und zwölf Gegnern bis zum Sieg gespielt; Niederlage und Neustart ebenfalls geprüft.
- Pause/Fortsetzen per Escape, Hilfedialog und Rückkehr zur Auswahl kontrolliert.
- Layout bei 390 Pixel Breite ohne horizontalen Überlauf geprüft; Touch-Schussknopf im Spiel verwendet.
- Bestwert und Sieg waren nach Neuladen weiterhin vorhanden. Die angezeigte erste Bestmarke stammt aus dieser Testrunde.
- Keine Warnungen oder Fehler in der Browserkonsole während der abschliessenden Kontrolle.

## Veröffentlichung als nächster Schritt

Der aktuelle Stand ist eine lokal spielbare Solo-Demo; öffentliches Hosting ist noch in Vorbereitung.
Die Solo-Version kann unabhängig von den vier Backend-Diensten gehostet werden.
Vor der Veröffentlichung sind ein erfolgreicher Produktionsbuild in einer passenden Build-Umgebung,
die Aktualisierung/Prüfung der vorhandenen Abhängigkeiten und die Wahl des Hosts erforderlich.

Der lokale Produktionsbuild war in der Windows-Sandbox durch `spawn EPERM` blockiert.
Ein diagnostischer Lauf ohne separaten Webpack-Prozess schaffte die Kompilierung und Typprüfung,
scheiterte aber an Nexts Worker-Thread-Serialisierung beim statischen Rendern (`DataCloneError`).
Diese experimentelle Konfiguration wurde nicht übernommen. Ein erfolgreicher vollständiger
Produktionsbuild wird daher noch nicht behauptet. Die Solo-Lint-Prüfung ist gezielt auf den neuen
Code beschränkt; sie ist keine Bereinigung aller älteren Multiplayer-Dateien.

Für öffentliches Multiplayer-Hosting müssen ausserdem Service-URLs, WebSocket-Adressen,
CORS, Datenbank-Seeds, Authentifizierung und Deployment der Java-Services abgestimmt werden.
Die bestehende Kachelgrafik-Lizenz bleibt unter `frontend/public/map/Tiles/License.txt` erhalten.
