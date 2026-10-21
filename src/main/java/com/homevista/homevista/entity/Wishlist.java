package com.homevista.homevista.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wishlist",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "property_id"}))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
}