package com.example.gameservice.Repository;

import com.example.gameservice.domain.CharacterPosition;
import org.springframework.data.repository.CrudRepository;

public interface CharacterRepository extends CrudRepository<CharacterPosition, Integer> {
}
