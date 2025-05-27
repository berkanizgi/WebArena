package com.example.gameservice.Repository;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.domain.GameCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;


public interface CharacterRepository extends JpaRepository<GameCharacter, String> {
    Optional<GameCharacter> findBySkin(String skin);
}
