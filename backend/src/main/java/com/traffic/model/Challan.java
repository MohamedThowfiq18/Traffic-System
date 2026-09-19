package com.traffic.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "challans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_plate", nullable = false)
    private String vehiclePlate;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "violation_type", nullable = false)
    private String violationType; // No Helmet, Speeding, Triple Riding, etc.

    @Column(name = "fine_amount", nullable = false)
    private BigDecimal fineAmount;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PAID

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
