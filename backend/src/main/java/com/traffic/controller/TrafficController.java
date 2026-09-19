package com.traffic.controller;

import com.traffic.model.Challan;
import com.traffic.model.Vehicle;
import com.traffic.repository.ChallanRepository;
import com.traffic.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to call APIs
public class TrafficController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ChallanRepository challanRepository;

    // 1. Get Vehicle details by Plate Number
    @GetMapping("/vehicles/{plate}")
    public ResponseEntity<?> getVehicleByPlate(@PathVariable String plate) {
        String cleanPlate = plate.replace("-", " ").toUpperCase().trim();
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(cleanPlate);
        
        if (vehicleOpt.isEmpty()) {
            // Check alternative formats
            vehicleOpt = vehicleRepository.findByLicensePlate(plate.toUpperCase().trim());
        }

        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            List<Challan> challans = challanRepository.findByVehiclePlate(vehicle.getLicensePlate());
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", vehicle);
            response.put("challans", challans);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Vehicle not found in database for plate: " + plate));
        }
    }

    // 2. Receive violation trigger from Python AI Service
    @PostMapping("/violations")
    public ResponseEntity<?> receiveViolation(@RequestBody Map<String, Object> payload) {
        String plate = (String) payload.get("plate");
        List<String> violations = (List<String>) payload.get("violations");
        
        if (plate == null || violations == null || violations.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid violation report payload"));
        }

        String cleanPlate = plate.replace("-", " ").toUpperCase().trim();
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(cleanPlate);
        
        if (vehicleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vehicle not found for plate: " + plate));
        }

        Vehicle vehicle = vehicleOpt.get();
        String ownerName = vehicle.getOwner().getName();
        
        // Define fine schema
        Map<String, BigDecimal> fineSchema = Map.of(
            "No Helmet", BigDecimal.valueOf(500.00),
            "Triple Riding", BigDecimal.valueOf(1000.00),
            "Mobile Phone Usage", BigDecimal.valueOf(1500.00),
            "Speeding", BigDecimal.valueOf(2000.00),
            "PUC Expired", BigDecimal.valueOf(1000.00)
        );

        // Process each violation
        for (String violation : violations) {
            BigDecimal fine = fineSchema.getOrDefault(violation, BigDecimal.valueOf(500.00));
            Challan newChallan = new Challan();
            newChallan.setVehiclePlate(vehicle.getLicensePlate());
            newChallan.setOwnerName(ownerName);
            newChallan.setViolationType(violation);
            newChallan.setFineAmount(fine);
            newChallan.setStatus("PENDING");
            
            challanRepository.save(newChallan);
        }

        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Violations registered successfully for plate " + plate,
            "count", violations.size()
        ));
    }

    // 3. Create Challan Manually (e.g. from Police Mobile App)
    @PostMapping("/challans")
    public ResponseEntity<?> createChallan(@RequestBody Challan challan) {
        if (challan.getVehiclePlate() == null || challan.getFineAmount() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        Challan saved = challanRepository.save(challan);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 4. Pay a Challan
    @PutMapping("/challans/{id}/pay")
    public ResponseEntity<?> payChallan(@PathVariable Long id) {
        Optional<Challan> challanOpt = challanRepository.findById(id);
        if (challanOpt.isPresent()) {
            Challan challan = challanOpt.get();
            challan.setStatus("PAID");
            challanRepository.save(challan);
            return ResponseEntity.ok(challan);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Challan not found"));
        }
    }

    // 5. Get General Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalVehicles = vehicleRepository.count();
        List<Challan> challans = challanRepository.findAll();
        
        long totalChallans = challans.size();
        long pendingChallans = challans.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
        long paidChallans = totalChallans - pendingChallans;

        double totalRevenue = challans.stream()
                .filter(c -> "PAID".equals(c.getStatus()))
                .mapToDouble(c -> c.getFineAmount().doubleValue())
                .sum();
                
        double pendingRevenue = challans.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .mapToDouble(c -> c.getFineAmount().doubleValue())
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", totalVehicles);
        stats.put("totalChallans", totalChallans);
        stats.put("pendingChallans", pendingChallans);
        stats.put("paidChallans", paidChallans);
        stats.put("totalRevenue", totalRevenue);
        stats.put("pendingRevenue", pendingRevenue);
        
        return ResponseEntity.ok(stats);
    }
}
