package com.homevista.homevista.repository;

import com.homevista.homevista.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("SELECT p FROM Property p WHERE " +
           "(:type IS NULL OR LOWER(p.type) = LOWER(:type)) AND " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:propertyType IS NULL OR LOWER(p.propertyType) = LOWER(:propertyType)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Property> search(@Param("type") String type,
                          @Param("location") String location,
                          @Param("propertyType") String propertyType,
                          @Param("minPrice") Double minPrice,
                          @Param("maxPrice") Double maxPrice);

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