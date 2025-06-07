package at.fhv.shopservice.repository;

import at.fhv.shopservice.domain.UpgradeItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UpgradeItemRepo extends JpaRepository<UpgradeItem, Long> {
}
