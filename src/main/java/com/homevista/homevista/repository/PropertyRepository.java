package com.homevista.homevista.repository;

import com.homevista.homevista.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    List<Property> findTop4ByFeaturedTrueOrderByIdDesc();

    List<Property> findTop4ByOrderByIdDesc();

    long countByTypeIgnoreCase(String type);

    // Most Visited ke liye: views ke hisaab se top 5
    List<Property> findTop5ByOrderByViewsDesc();

    // Views +1 (purani rows mein views NULL ho to 0 se shuru hoga)
    @Modifying
    @Transactional
    @Query("UPDATE Property p SET p.views = COALESCE(p.views, 0) + 1 WHERE p.id = :id")
    int incrementViews(@Param("id") Long id);
}