package com.example.gameservice.Repository;


import com.example.gameservice.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, String> {
    Player findByUsername(String username);
}

