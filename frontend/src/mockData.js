// Preloaded Mock Database for AI Smart Traffic Police Assistant

export const initialVehicles = [
  {
    id: 1,
    licensePlate: "TN 38 AB 1234",
    brand: "Hero",
    model: "Splendor Plus",
    color: "Black-Red",
    insuranceStatus: "VALID",
    insuranceExpiry: "2027-03-12",
    pucStatus: "EXPIRED",
    pucExpiry: "2026-06-15",
    roadTaxStatus: "VALID",
    roadTaxExpiry: "2028-10-20",
    isBlacklisted: false,
    isStolen: false,
    owner: {
      name: "Ramesh Kumar",
      licenseNumber: "DL-1420210098765",
      licenseStatus: "VALID",
      contactNumber: "+91 9876543210",
      address: "12 Bank Street, Karol Bagh, New Delhi"
    }
  },
  {
    id: 2,
    licensePlate: "DL 3C AM 5678",
    brand: "Bajaj",
    model: "Pulsar 150",
    color: "Blue",
    insuranceStatus: "EXPIRED",
    insuranceExpiry: "2026-04-10",
    pucStatus: "VALID",
    pucExpiry: "2026-09-30",
    roadTaxStatus: "VALID",
    roadTaxExpiry: "2027-12-15",
    isBlacklisted: false,
    isStolen: false,
    owner: {
      name: "Anita Sharma",
      licenseNumber: "MH-1220190045612",
      licenseStatus: "EXPIRED",
      contactNumber: "+91 8765432109",
      address: "45 Park Avenue, Pune, Maharashtra"
    }
  },
  {
    id: 3,
    licensePlate: "KA 51 MB 9999",
    brand: "Honda",
    model: "Activa 6G",
    color: "White",
    insuranceStatus: "VALID",
    insuranceExpiry: "2026-11-25",
    pucStatus: "EXPIRED",
    pucExpiry: "2026-05-18",
    roadTaxStatus: "EXPIRED",
    roadTaxExpiry: "2026-02-10",
    isBlacklisted: true,
    isStolen: true,
    owner: {
      name: "Vikram Singh",
      licenseNumber: "KA-5120150033221",
      licenseStatus: "SUSPENDED",
      contactNumber: "+91 7654321098",
      address: "89 Electronic City, Bengaluru, Karnataka"
    }
  },
  {
    id: 4,
    licensePlate: "MH 12 QP 4321",
    brand: "KTM",
    model: "Duke 390",
    color: "Orange",
    insuranceStatus: "VALID",
    insuranceExpiry: "2027-08-30",
    pucStatus: "VALID",
    pucExpiry: "2026-12-12",
    roadTaxStatus: "VALID",
    roadTaxExpiry: "2029-05-05",
    isBlacklisted: false,
    isStolen: false,
    owner: {
      name: "Rahul Mehta",
      licenseNumber: "DL-3C20230001234",
      licenseStatus: "VALID",
      contactNumber: "+91 9988776655",
      address: "Sector 15, Dwarka, New Delhi"
    }
  },
  {
    id: 5,
    licensePlate: "UP 16 TR 7777",
    brand: "Royal Enfield",
    model: "Classic 350",
    color: "Gunmetal Grey",
    insuranceStatus: "VALID",
    insuranceExpiry: "2028-01-15",
    pucStatus: "VALID",
    pucExpiry: "2026-11-20",
    roadTaxStatus: "VALID",
    roadTaxExpiry: "2032-06-18",
    isBlacklisted: false,
    isStolen: false,
    owner: {
      name: "Sanjay Dutt",
      licenseNumber: "UP-1620180005432",
      licenseStatus: "VALID",
      contactNumber: "+91 9540001122",
      address: "Sector 62, Noida, Uttar Pradesh"
    }
  }
];

export const initialChallans = [
  {
    id: 101,
    vehiclePlate: "TN 38 AB 1234",
    ownerName: "Ramesh Kumar",
    violationType: "PUC Expired",
    fineAmount: 1000,
    status: "PENDING",
    createdAt: "2026-07-23T14:32:00Z"
  },
  {
    id: 102,
    vehiclePlate: "TN 38 AB 1234",
    ownerName: "Ramesh Kumar",
    violationType: "No Helmet",
    fineAmount: 500,
    status: "PENDING",
    createdAt: "2026-07-24T09:15:00Z"
  },
  {
    id: 103,
    vehiclePlate: "KA 51 MB 9999",
    ownerName: "Vikram Singh",
    violationType: "Riding Without License",
    fineAmount: 5000,
    status: "PENDING",
    createdAt: "2026-07-20T11:05:00Z"
  }
];

// Preconfigured camera feeds simulating actual highway monitoring nodes
export const cameraScenarios = [
  {
    id: "cam-01",
    name: "Camera Node 04 - Karol Bagh",
    description: "Helmet & General Document Check",
    defaultPlate: "TN 38 AB 1234",
    speed: 48,
    violationDetected: ["No Helmet", "PUC Expired"],
    vehicleType: "Motorcycle (Hero Splendor)",
    activeImage: "helmet_violation", // simulated canvas design
    canvasData: {
      bikeBbox: { x: 50, y: 120, w: 220, h: 240, label: "Motorcycle (94%)" },
      plateBbox: { x: 140, y: 310, w: 80, h: 30, label: "TN 38 AB 1234 (92%)" },
      headBbox: { x: 125, y: 50, w: 55, h: 55, label: "Violation: No Helmet (98%)", color: "#ef4444" }
    }
  },
  {
    id: "cam-02",
    name: "Camera Node 12 - Pune Expressway",
    description: "Triple Riding Violation Check",
    defaultPlate: "DL 3C AM 5678",
    speed: 55,
    violationDetected: ["Triple Riding", "Insurance Expired"],
    vehicleType: "Motorcycle (Bajaj Pulsar)",
    activeImage: "triple_riding",
    canvasData: {
      bikeBbox: { x: 40, y: 100, w: 240, h: 260, label: "Motorcycle (89%)" },
      plateBbox: { x: 130, y: 320, w: 80, h: 32, label: "DL 3C AM 5678 (85%)" },
      ridersBbox: { x: 60, y: 30, w: 180, h: 140, label: "Violation: Triple Riding (95%)", color: "#ef4444" }
    }
  },
  {
    id: "cam-03",
    name: "Camera Node 08 - Electronic City Flyover",
    description: "Stolen & Blacklist Vehicle Sweep",
    defaultPlate: "KA 51 MB 9999",
    speed: 42,
    violationDetected: ["Mobile Phone Usage", "Stolen Vehicle", "Suspended License"],
    vehicleType: "Scooter (Honda Activa)",
    activeImage: "mobile_usage",
    canvasData: {
      bikeBbox: { x: 70, y: 110, w: 180, h: 230, label: "Motorcycle (91%)" },
      plateBbox: { x: 120, y: 290, w: 75, h: 30, label: "KA 51 MB 9999 (96%)" },
      phoneBbox: { x: 130, y: 140, w: 30, h: 40, label: "Violation: Phone Usage (92%)", color: "#ef4444" }
    }
  },
  {
    id: "cam-04",
    name: "Camera Node 15 - Dwarka Road",
    description: "Speed Violations & OCR Sweep",
    defaultPlate: "MH 12 QP 4321",
    speed: 92, // speed limit: 60
    violationDetected: ["Speeding (92 km/h)"],
    vehicleType: "Sports Bike (KTM Duke)",
    activeImage: "speeding",
    canvasData: {
      bikeBbox: { x: 30, y: 90, w: 260, h: 270, label: "Motorcycle (97%)" },
      plateBbox: { x: 130, y: 300, w: 90, h: 35, label: "MH 12 QP 4321 (98%)" },
      speedIndicator: { x: 220, y: 40, w: 80, h: 40, label: "92 km/h (Limit: 60)", color: "#ef4444" }
    }
  },
  {
    id: "cam-05",
    name: "Camera Node 03 - Noida Sector 62",
    description: "All Clear Compliance Check",
    defaultPlate: "UP 16 TR 7777",
    speed: 52,
    violationDetected: [],
    vehicleType: "Cruiser (RE Classic)",
    activeImage: "all_clear",
    canvasData: {
      bikeBbox: { x: 50, y: 100, w: 220, h: 250, label: "Motorcycle (99%)" },
      plateBbox: { x: 120, y: 310, w: 80, h: 30, label: "UP 16 TR 7777 (98%)" },
      helmetBbox: { x: 130, y: 40, w: 60, h: 60, label: "Helmet Detected (99%)", color: "#22c55e" }
    }
  }
];
