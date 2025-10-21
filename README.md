# WebArena

WebArena ist ein webbasiertes Multiplayer-Spiel, das im Rahmen des Studiengangs "Software and Information Engineering" an der Fachhochschule Vorarlberg entwickelt wurde.  
Das Projekt orientiert sich konzeptionell an Spielen wie "Brawl Stars" und verfolgt das Ziel, eine verteilte Microservice-Architektur mit Spring Boot, WebSocket-Kommunikation und einem modernen Webfrontend auf Basis von Next.js umzusetzen.

---

## Projektüberblick

Das System besteht aus mehreren eigenständigen Services, die jeweils über REST-Schnittstellen und teilweise über STOMP-WebSockets miteinander kommunizieren.  
Das Frontend dient als zentrales Dashboard für Benutzerinteraktionen und verbindet sich mit den Services zur Laufzeit.

---

## Architektur

### Microservices

| Service | Beschreibung | Standard-Port |
|----------|---------------|---------------|
| **GameService** | Verantwortlich für Spiellogik, Sessions, Bewegungen, Angriffe und Health-Management. | 8081 |
| **CharacterService** | Verwaltung von Charakteren, Basiswerten (Health, Attack, Speed) und Spielercharakter-Zuweisungen. | 8084 |
| **MapService** | Stellt Karteninformationen, Spawnpunkte und Item-Koordinaten bereit. | 8080 |
| **ShopService** | Ermöglicht Transaktionen im Spiel (z. B. Coin-Belohnungen, Käufe, freigeschaltete Levels). | 8083 |

---

## Technologie-Stack

**Backend:**
- Java 21 / Spring Boot 3.4.x
- Spring Web, Spring Data JPA, Spring Security
- PostgreSQL (über Docker-Container)
- WebSocket (STOMP)
- Resilience4j (Circuit Breaker)
- OpenAPI / Swagger UI

**Frontend:**
- Next.js 15 (React 18, TypeScript)
- Phaser (für Spiellogik und Animationen)
- React Toastify (Benachrichtigungen)
- Tailwind CSS für Layout und Styling

---

## Datenbank (Docker Setup)

Zum Starten der PostgreSQL-Datenbank wird ein einfacher Docker-Container verwendet:

```bash
docker rm -f webarena-db
docker run --name webarena-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=webarena \
  -p 5432:5432 -d postgres
