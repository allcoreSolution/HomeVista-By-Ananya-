package com.homevista.homevista.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String location;
    private String type;          // buy, rent, commercial
    private String propertyType;  // apartment, villa, plot, office ...
    private Double price;
    private String imageUrl;

    private String bhk;
    private String bath;
    private String area;
    private String furnished;

    @Column(length = 1000)
    private String description;

    // Home page ke Featured section ke liye
    private Boolean featured = false;

    public Property() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getBhk() { return bhk; }
    public void setBhk(String bhk) { this.bhk = bhk; }
    public String getBath() { return bath; }
    public void setBath(String bath) { this.bath = bath; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getFurnished() { return furnished; }
    public void setFurnished(String furnished) { this.furnished = furnished; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
}