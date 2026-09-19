package com.traffic.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private Owner owner;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String brand;

    private String color;

    @Column(name = "insurance_status")
    private String insuranceStatus; // VALID, EXPIRED

    @Column(name = "insurance_expiry", nullable = false)
    private LocalDate insuranceExpiry;

    @Column(name = "puc_status")
    private String pucStatus; // VALID, EXPIRED

    @Column(name = "puc_expiry", nullable = false)
    private LocalDate pucExpiry;

    @Column(name = "road_tax_status")
    private String roadTaxStatus; // VALID, EXPIRED

    @Column(name = "road_tax_expiry", nullable = false)
    private LocalDate roadTaxExpiry;

    @Column(name = "is_blacklisted")
    private Boolean isBlacklisted = false;

    @Column(name = "is_stolen")
    private Boolean isStolen = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
