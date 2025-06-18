package at.fhv.characterservice.controller;

import at.fhv.characterservice.domain.GameCharacter;
import at.fhv.characterservice.domain.Player;
import at.fhv.characterservice.dto.GameCharacterDTO;
import at.fhv.characterservice.dto.PlayerOwnedCharacterDTO;
import at.fhv.characterservice.repository.CharacterRepository;
import at.fhv.characterservice.repository.PlayerOwnedCharacterRepository;
import at.fhv.characterservice.repository.PlayerRepository;
import at.fhv.characterservice.request.AddOwnedCharacterRequest;
import at.fhv.characterservice.service.CharacterService;
import at.fhv.characterservice.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PlayerOwnedCharacterRepository playerOwnedCharacterRepository;

    @Autowired
    private CharacterService characterService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private CharacterRepository characterRepository;


    @GetMapping
    public List<GameCharacterDTO> getAllCharacters() {
        return characterService.getAllCharacters();
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerPlayer(@RequestParam String playerId, @RequestParam String skin) {
        boolean success = characterService.registerCharacter(playerId, skin);
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(409).build();
    }

    @PostMapping("/unregister")
    public ResponseEntity<Void> unregisterPlayer(@RequestParam String skin) {
        characterService.releaseCharacter(skin);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{playerId}/character-overview")
    public ResponseEntity<Map<String, Object>> getCharacterOverview(@PathVariable String playerId) {
        Optional<Player> optionalPlayer = playerRepository.findById(playerId);
        if (optionalPlayer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Player player = optionalPlayer.get();
        String selectedCharacterId = walletService.getSelectedCharacterId(player.getPlayerId());


        List<PlayerOwnedCharacterDTO> ownedCharacters = playerOwnedCharacterRepository.findByPlayer(player)
                .stream()
                .map(PlayerOwnedCharacterDTO::new)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("selectedCharacterId", selectedCharacterId);
        response.put("ownedCharacters", ownedCharacters);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{playerId}/owned-characters")
    public List<PlayerOwnedCharacterDTO> getOwnedCharacters(@PathVariable String playerId) {
        Player player = playerRepository.findById(playerId).orElseThrow();
        return playerOwnedCharacterRepository.findByPlayer(player).stream()
                .map(PlayerOwnedCharacterDTO::new)
                .collect(Collectors.toList());
    }

    @PostMapping("/{playerId}/level-up/{characterId}")
    public ResponseEntity<String> levelUpCharacter(
            @PathVariable String playerId,
            @PathVariable String characterId
    ) {
        try {
            characterService.levelUpCharacter(playerId, characterId);
            return ResponseEntity.ok("Level up erfolgreich");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{playerId}/select-character")
    public ResponseEntity<Void> updateWalletCharacter(@PathVariable String playerId, @RequestBody Map<String, String> request) {
        String characterId = request.get("characterId");
        walletService.updateCharacterId(playerId, characterId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/owned-character")
    public ResponseEntity<Void> createOwnedCharacter(@RequestBody AddOwnedCharacterRequest request) {
        characterService.createOwnedCharacter(request.getPlayerId(), request.getCharacterId());
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{playerId}/owned-character/{characterId}")
    public ResponseEntity<PlayerOwnedCharacterDTO> getOwnedCharacter(
            @PathVariable String playerId,
            @PathVariable String characterId) {

        Optional<Player> playerOpt = playerRepository.findById(playerId);
        if (playerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return playerOwnedCharacterRepository
                .findByPlayerAndGameCharacter_CharacterId(playerOpt.get(), characterId)
                .map(owned -> ResponseEntity.ok(new PlayerOwnedCharacterDTO(owned)))
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/all-base-stats")
    public List<GameCharacterDTO> getAllBaseStats() {
        return characterService.getAllBaseStats();
    }











}
