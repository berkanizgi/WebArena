//package com.example.gameservice.controller;
//
//import com.example.gameservice.domain.Player;
//import com.example.gameservice.Repository.PlayerRepository;
//import com.example.gameservice.service.GameSessionService;
//import com.example.gameservice.session.GameSession;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/game-session")
//public class GameSessionController {
//
//    private final PlayerRepository playerRepository;
//    private final GameSessionService gameSessionService;
//
//    public GameSessionController(PlayerRepository playerRepository, GameSessionService gameSessionService) {
//        this.playerRepository = playerRepository;
//        this.gameSessionService = gameSessionService;
//    }
//
//    @PostMapping("/start")
//    public GameSession startSession(@RequestParam String playerId) {
//        Player player = playerRepository.findById(playerId).orElseThrow();
//        return gameSessionService.createSessionForPlayer(player);
//    }
//
//    @GetMapping("/status")
//    public Map<String, Object> getStatus(@RequestParam String sessionId) {
//        GameSession session = gameSessionService.getSession(sessionId);
//        if (session == null) {
//            return Map.of("readyCount", 0, "totalCount", 0);
//        }
//
//        int totalCount = session.getPlayers().size();
//        int readyCount = session.getPlayers().size(); // Optional: falls du später echte "ready"-Daten verwaltest
//
//        return Map.of(
//                "readyCount", readyCount,
//                "totalCount", totalCount
//        );
//    }
//
//}
