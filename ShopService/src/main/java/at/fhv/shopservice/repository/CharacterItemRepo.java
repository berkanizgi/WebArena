package at.fhv.shopservice.repository;

import at.fhv.shopservice.domain.CharacterItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterItemRepo extends JpaRepository<CharacterItem, Long> {
}
