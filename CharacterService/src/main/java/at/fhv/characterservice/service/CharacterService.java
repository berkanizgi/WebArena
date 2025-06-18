package at.fhv.characterservice.service;

import at.fhv.characterservice.domain.GameCharacter;
import at.fhv.characterservice.domain.Player;
import at.fhv.characterservice.domain.PlayerOwnedCharacter;
import at.fhv.characterservice.domain.Wallet;
import at.fhv.characterservice.dto.GameCharacterDTO;
import at.fhv.characterservice.repository.CharacterRepository;
import at.fhv.characterservice.repository.PlayerOwnedCharacterRepository;
import at.fhv.characterservice.repository.PlayerRepository;
import at.fhv.characterservice.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CharacterService {
    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PlayerOwnedCharacterRepository playerOwnedCharacterRepository;

    @Autowired
    private WalletRepository walletRepository;


    private Set<String> usedSkins = new HashSet<>();

    public List<GameCharacterDTO> getAllCharacters() {
        return characterRepository.findAll().stream().map(character ->
                new GameCharacterDTO(
                        character.getCharacterId(),
                        character.getName(),
                        character.getSkin(),
                        character.getBaseHealth(),
                        character.getBaseAttack(),
                        character.getSpeed(),
                        character.getRole(),
                        character.getDescription(),
                        character.getRare())
        ).toList();
    }

    public boolean registerCharacter(String playerId, String skin) {
        Optional<GameCharacter> optional = characterRepository.findBySkin(skin);
        if (optional.isEmpty() || usedSkins.contains(skin)) return false;
        usedSkins.add(skin);
        return true;
    }

    public void releaseCharacter(String skin) {
        usedSkins.remove(skin);
    }

    public void levelUpCharacter(String playerId, String characterId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        PlayerOwnedCharacter poc = playerOwnedCharacterRepository.findByPlayer(player).stream()
                .filter(c -> c.getGameCharacter().getCharacterId().equals(characterId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Character not owned by player"));

        Wallet wallet = walletRepository.findByPlayerId(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        int cost = poc.getNextUpgradeCost();
        if (wallet.getCoins() < cost) {
            throw new IllegalStateException("Nicht genügend Coins für Level-Up");
        }

        // Coins abziehen
        wallet.setCoins(wallet.getCoins() - cost);

        // Level erhöhen
        poc.setUpgradeLevel(poc.getUpgradeLevel() + 1);

        // Neue Kosten berechnen
        poc.setNextUpgradeCost(1000 * poc.getUpgradeLevel());

        // Werte steigern
        poc.setBaseHealth((int) (poc.getBaseHealth() * 1.1));
        poc.setBaseAttack((int) (poc.getBaseAttack() * 1.1));
        poc.setBaseSpeed((int) (poc.getBaseSpeed() * 1.1));
        poc.setProjectileSpeed((int) (poc.getProjectileSpeed() * 1.05));

        // Speichern
        walletRepository.save(wallet);
        playerOwnedCharacterRepository.save(poc);
    }

    public void createOwnedCharacter(String playerId, String characterId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        GameCharacter character = characterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        PlayerOwnedCharacter poc = new PlayerOwnedCharacter();
        poc.setPlayer(player);
        poc.setGameCharacter(character);
        poc.setBaseHealth(character.getBaseHealth());
        poc.setBaseAttack(character.getBaseAttack());
        poc.setBaseSpeed(character.getSpeed());
        poc.setProjectileSpeed(10); // Optional: dynamisch, falls später unterstützt
        poc.setNextUpgradeCost(1000);
        poc.setUpgradeLevel(1);
        poc.setPurchaseDate(LocalDateTime.now());

        playerOwnedCharacterRepository.save(poc);
    }



}