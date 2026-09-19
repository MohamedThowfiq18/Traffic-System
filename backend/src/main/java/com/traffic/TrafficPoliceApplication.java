package com.traffic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TrafficPoliceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrafficPoliceApplication.class, args);
        System.out.println("----------------------------------------------");
        System.out.println("AI Smart Traffic Police Assistant Service Is Running on http://localhost:8080");
        System.out.println("----------------------------------------------");
    }
}
