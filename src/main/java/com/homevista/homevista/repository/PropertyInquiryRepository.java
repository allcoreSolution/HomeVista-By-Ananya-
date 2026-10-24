package com.homevista.homevista.repository;

import com.homevista.homevista.entity.PropertyInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {

    List<PropertyInquiry> findAllByOrderByCreatedAtDesc();

    List<PropertyInquiry> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}