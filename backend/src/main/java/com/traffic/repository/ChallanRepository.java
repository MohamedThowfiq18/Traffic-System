package com.traffic.repository;

import com.traffic.model.Challan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChallanRepository extends JpaRepository<Challan, Long> {
    List<Challan> findByVehiclePlate(String vehiclePlate);
}
