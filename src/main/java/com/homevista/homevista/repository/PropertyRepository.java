package com.homevista.homevista.repository;

import com.homevista.homevista.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
}