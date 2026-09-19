import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Shield, Cpu, Database, Upload, Camera, Search, 
  Printer, AlertTriangle, CheckCircle2, Play, Plus, RefreshCw, 
  FileText, User, Car, Check, X, Phone, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { initialVehicles, initialChallans, cameraScenarios } from './mockData';

function App() {
  // App state
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [challans, setChallans] = useState(initialChallans);
  const [activeScenario, setActiveScenario] = useState(cameraScenarios[0]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, database, upload
  
  // Console logs state
  const [aiLogs, setAiLogs] = useState([]);
  const [backendLogs, setBackendLogs] = useState([]);
  
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlate, setScannedPlate] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(0);
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Mobile emulator state
  const [mobileSearchPlate, setMobileSearchPlate] = useState('');
  const [mobileResult, setMobileResult] = useState(null);
  const [manualChallanType, setManualChallanType] = useState('No Helmet');
  const [manualFine, setManualFine] = useState(500);

  // New vehicle state (for database insert form)
  const [newPlate, setNewPlate] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newDLStatus, setNewDLStatus] = useState('VALID');

  // Receipt modal state
  const [receiptChallan, setReceiptChallan] = useState(null);

  // Refs for auto-scroll terminal logs
  const aiTerminalEndRef = useRef(null);
  const backendTerminalEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    aiTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiLogs]);

  useEffect(() => {
    backendTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [backendLogs]);

  // Run AI scan sequence whenever scenario changes or custom image is uploaded
  const triggerScanSequence = (plateNumber, violationsList, vehicleInfo, customImage = null) => {
    setIsScanning(true);
    setScannedPlate('');
    setOcrConfidence(0);

    // Initial AI logs
    const tempAiLogs = [
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Listening on Camera Stream...`,
      `[${new Date().toLocaleTimeString()}] [YOLOv8] Running inference on video frame...`,
    ];
    setAiLogs(tempAiLogs);

    // Initial Backend logs
    setBackendLogs([
      `[${new Date().toLocaleTimeString()}] [SPRING-BOOT] REST endpoint standby.`,
    ]);

    // 1. Detect Motorcycle
    setTimeout(() => {
      setAiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [YOLOv8] Class Detected: Motorcycle (94% confidence)`,
        `[${new Date().toLocaleTimeString()}] [YOLOv8] Localized License Plate Region: bounding_box=[x1, y1, x2, y2]`
      ]);
    }, 800);

    // 2. OCR Reading Plate Number
    setTimeout(() => {
      setAiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [PaddleOCR] Initializing OCR text segmentation...`,
        `[${new Date().toLocaleTimeString()}] [PaddleOCR] Reading plate characters: `
      ]);

      // Simulate typing out plate letters
      let chars = plateNumber.replace(/\s/g, '');
      let currentWord = '';
      let charIdx = 0;
      
      const interval = setInterval(() => {
        if (charIdx < chars.length) {
          currentWord += chars[charIdx];
          setScannedPlate(currentWord);
          charIdx++;
        } else {
          clearInterval(interval);
        }
      }, 150);
    }, 1800);

    // 3. OCR Complete & Violation Check
    setTimeout(() => {
      const conf = Math.floor(Math.random() * 8) + 91; // 91% to 98%
      setOcrConfidence(conf);
      setAiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [PaddleOCR] Read complete: "${plateNumber}" (Confidence: ${conf}%)`,
        `[${new Date().toLocaleTimeString()}] [YOLOv8] Bounding boxes evaluated for violations.`,
        `[${new Date().toLocaleTimeString()}] [YOLOv8] Violations Flagged: [${violationsList.join(', ') || 'NONE'}]`,
        `[${new Date().toLocaleTimeString()}] [AI-SERVICE] Sending POST payload to Spring Boot Backend http://localhost:8080/api/violations...`
      ]);
    }, 3200);

    // 4. Spring Boot REST API Endpoint Triggers
    setTimeout(() => {
      setBackendLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [HTTP] POST /api/violations - Payload: { "plate": "${plateNumber}", "violations": ${JSON.stringify(violationsList)} }`,
        `[${new Date().toLocaleTimeString()}] [JPA-REPO] Executing: SELECT * FROM vehicles WHERE license_plate = '${plateNumber}'`
      ]);
    }, 3800);

    // 5. Spring Boot Database Verification
    setTimeout(() => {
      // Find vehicle
      const matchedVehicle = vehicles.find(v => v.licensePlate.replace(/\s/g, '') === plateNumber.replace(/\s/g, ''));
      
      if (matchedVehicle) {
        // Document evaluations
        const licenseStatus = matchedVehicle.owner.licenseStatus;
        const insStatus = matchedVehicle.insuranceStatus;
        const pucStatus = matchedVehicle.pucStatus;
        const stolenStatus = matchedVehicle.isStolen ? "STOLEN" : "CLEAR";

        setBackendLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SQL] Fetch Success. Owner: "${matchedVehicle.owner.name}"`,
          `[${new Date().toLocaleTimeString()}] [STATUS] Document Audit: DL=${licenseStatus}, Insurance=${insStatus}, PUC=${pucStatus}, Stolen=${stolenStatus}`,
        ]);

        // Auto-create challans for violations & expired documents
        let triggeredViolations = [...violationsList];
        
        // Check expired databases of vehicles inside the DB logic
        if (pucStatus === 'EXPIRED' && !triggeredViolations.includes('PUC Expired')) {
          triggeredViolations.push('PUC Expired');
        }
        if (insStatus === 'EXPIRED' && !triggeredViolations.includes('Insurance Expired')) {
          triggeredViolations.push('Insurance Expired');
        }
        if (licenseStatus === 'EXPIRED' && !triggeredViolations.includes('Expired Driving Licence')) {
          triggeredViolations.push('Expired Driving Licence');
        }
        if (licenseStatus === 'SUSPENDED' && !triggeredViolations.includes('Suspended Licence Violation')) {
          triggeredViolations.push('Suspended Licence Violation');
        }
        if (matchedVehicle.isStolen && !triggeredViolations.includes('Stolen Vehicle Alarm')) {
          triggeredViolations.push('Stolen Vehicle Alarm');
        }

        // Write challans to state
        if (triggeredViolations.length > 0) {
          const fineSchema = {
            "No Helmet": 500,
            "Triple Riding": 1000,
            "Mobile Phone Usage": 1500,
            "Speeding": 2000,
            "Speeding (92 km/h)": 2000,
            "PUC Expired": 1000,
            "Insurance Expired": 1000,
            "Expired Driving Licence": 2000,
            "Suspended Licence Violation": 5000,
            "Stolen Vehicle Alarm": 10000
          };

          const newChallans = triggeredViolations.map((viol, index) => {
            const fine = fineSchema[viol] || 500;
            return {
              id: Date.now() + index,
              vehiclePlate: matchedVehicle.licensePlate,
              ownerName: matchedVehicle.owner.name,
              violationType: viol,
              fineAmount: fine,
              status: "PENDING",
              createdAt: new Date().toISOString()
            };
          });

          // Insert into local state
          setChallans(prev => [...prev, ...newChallans]);

          setBackendLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [JPA-REPO] Registering ${newChallans.length} e-challan tickets...`,
            ...newChallans.map(nc => `[${new Date().toLocaleTimeString()}] [INSERT] Saved Challan ID: ${nc.id} - ${nc.violationType} | Fine: ₹${nc.fineAmount} (PENDING)`)
          ]);
        }

        setBackendLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [HTTP] 200 OK - Vehicle analysis successfully completed.`
        ]);

        // Auto update mobile emulator if it's currently focused on this plate
        if (mobileSearchPlate.toUpperCase().replace(/[\s-]/g, '') === plateNumber.replace(/[\s-]/g, '')) {
          handleMobileLookup(matchedVehicle.licensePlate);
        }

      } else {
        setBackendLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SQL] NO RECORD FOUND for plate ${plateNumber}. Flags: Unknown Vehicle.`,
          `[${new Date().toLocaleTimeString()}] [HTTP] 404 NOT FOUND.`
        ]);
      }
      
      setIsScanning(false);
    }, 5000);
  };

  // Trigger scanning sequence when selecting a new scenario (under dashboard tab)
  useEffect(() => {
    if (activeTab === 'dashboard') {
      triggerScanSequence(
        activeScenario.defaultPlate,
        activeScenario.violationDetected,
        activeScenario.vehicleType
      );
    }
  }, [activeScenario, activeTab]);

  // Mobile Emulator search function
  const handleMobileLookup = (searchVal) => {
    const cleanSearchVal = searchVal.toUpperCase().replace(/[\s-]/g, '').trim();
    if (!cleanSearchVal) return;

    const matchedVeh = vehicles.find(v => v.licensePlate.toUpperCase().replace(/[\s-]/g, '') === cleanSearchVal);
    
    if (matchedVeh) {
      const associatedChallans = challans.filter(c => c.vehiclePlate.toUpperCase().replace(/[\s-]/g, '') === cleanSearchVal);
      setMobileResult(matchedVeh);
      setMobileSearchPlate(matchedVeh.licensePlate);
    } else {
      setMobileResult(null);
      alert(`Vehicle with plate "${searchVal}" not found in database.`);
    }
  };

  // Create manual challan from mobile
  const handleCreateManualChallan = () => {
    if (!mobileResult) return;
    
    const newChan = {
      id: Date.now(),
      vehiclePlate: mobileResult.licensePlate,
      ownerName: mobileResult.owner.name,
      violationType: manualChallanType,
      fineAmount: manualFine,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    setChallans(prev => [...prev, newChan]);
    
    // Add log in Backend Console
    setBackendLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [HTTP] POST /api/challans (Manual) - User: PoliceBadge-302`,
      `[${new Date().toLocaleTimeString()}] [INSERT] Saved Challan ID: ${newChan.id} - ${newChan.violationType} | Fine: ₹${newChan.fineAmount}`
    ]);
  };

  // Toggle vehicle status in DB manager directly (to show dynamic presentation changes)
  const handleToggleDocStatus = (vehicleId, docField) => {
    setVehicles(prev => prev.map(veh => {
      if (veh.id === vehicleId) {
        if (docField === 'insuranceStatus') {
          return { ...veh, insuranceStatus: veh.insuranceStatus === 'VALID' ? 'EXPIRED' : 'VALID' };
        }
        if (docField === 'pucStatus') {
          return { ...veh, pucStatus: veh.pucStatus === 'VALID' ? 'EXPIRED' : 'VALID' };
        }
        if (docField === 'licenseStatus') {
          const nextStatus = veh.owner.licenseStatus === 'VALID' ? 'EXPIRED' : (veh.owner.licenseStatus === 'EXPIRED' ? 'SUSPENDED' : 'VALID');
          return { ...veh, owner: { ...veh.owner, licenseStatus: nextStatus } };
        }
        if (docField === 'isBlacklisted') {
          return { ...veh, isBlacklisted: !veh.isBlacklisted };
        }
      }
      return veh;
    }));

    // Log update in backend terminal
    setBackendLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SQL] UPDATE vehicles SET ${docField} = value WHERE id = ${vehicleId}`
    ]);
  };

  // Pay challan manually
  const handlePayChallan = (challanId) => {
    setChallans(prev => prev.map(c => {
      if (c.id === challanId) {
        return { ...c, status: 'PAID' };
      }
      return c;
    }));

    // Log update in backend terminal
    setBackendLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SQL] UPDATE challans SET status = 'PAID' WHERE id = ${challanId}`,
      `[${new Date().toLocaleTimeString()}] [SPRING-BOOT] Challan receipt cleared.`
    ]);
  };

  // Add new vehicle to mock database
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newPlate || !newOwnerName || !newBrand || !newModel) {
      alert("Please fill in all vehicle registration fields.");
      return;
    }

    const cleanPlate = newPlate.toUpperCase().trim();
    if (vehicles.some(v => v.licensePlate.replace(/\s/g, '') === cleanPlate.replace(/\s/g, ''))) {
      alert("This license plate number already exists.");
      return;
    }

    const newVehObj = {
      id: Date.now(),
      licensePlate: cleanPlate,
      brand: newBrand,
      model: newModel,
      color: "Silver",
      insuranceStatus: "VALID",
      insuranceExpiry: "2028-09-10",
      pucStatus: "VALID",
      pucExpiry: "2027-01-20",
      roadTaxStatus: "VALID",
      roadTaxExpiry: "2030-05-15",
      isBlacklisted: false,
      isStolen: false,
      owner: {
        name: newOwnerName,
        licenseNumber: `DL-12${Date.now().toString().slice(-11)}`,
        licenseStatus: newDLStatus,
        contactNumber: "+91 9900112233",
        address: "New Registered Address, Delhi"
      }
    };

    setVehicles(prev => [...prev, newVehObj]);
    
    // Log to backend
    setBackendLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SQL] INSERT INTO owners VALUES (...)`,
      `[${new Date().toLocaleTimeString()}] [SQL] INSERT INTO vehicles VALUES (plate='${cleanPlate}')`
    ]);

    // Reset inputs
    setNewPlate('');
    setNewOwnerName('');
    setNewBrand('');
    setNewModel('');
    
    alert(`Vehicle ${cleanPlate} registered successfully! You can now test scan it.`);
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    
    // Read file as data URI
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      
      // Select a random plate from DB to simulate successful OCR read on uploaded image
      const randomVeh = vehicles[Math.floor(Math.random() * vehicles.length)];
      const randomViolations = [
        ["No Helmet"], 
        ["Triple Riding"], 
        ["Mobile Phone Usage"],
        ["No Helmet", "PUC Expired"], 
        []
      ][Math.floor(Math.random() * 5)];
      
      triggerScanSequence(
        randomVeh.licensePlate,
        randomViolations,
        `${randomVeh.brand} ${randomVeh.model}`,
        event.target.result
      );
    };
    reader.readAsDataURL(file);
  };

  // Calculate dynamic stats from React state
  const totalVehiclesCount = vehicles.length;
  const pendingChallansCount = challans.filter(c => c.status === 'PENDING').length;
  const totalPaidRevenue = challans.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.fineAmount, 0);
  const totalPendingFines = challans.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.fineAmount, 0);

  // Trigger print receipt modal
  const handlePrintReceipt = (challanItem) => {
    setReceiptChallan(challanItem);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="header-container">
        <div className="logo-section">
          <Shield className="logo-icon text-danger" size={32} fill="rgba(255, 23, 68, 0.2)" />
          <div>
            <h1>ITMS Dashboard</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Intelligent Traffic Management & ANPR System</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="badge-live">
            <span className="live-dot"></span>
            LIVE RADAR ACTIVE
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`receipt-btn ${activeTab === 'dashboard' ? 'print' : ''}`}
              style={{ background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.8rem', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`receipt-btn ${activeTab === 'database' ? 'print' : ''}`}
              style={{ background: activeTab === 'database' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.8rem', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => setActiveTab('database')}
            >
              DB Explorer
            </button>
            <button 
              className={`receipt-btn ${activeTab === 'upload' ? 'print' : ''}`}
              style={{ background: activeTab === 'upload' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.8rem', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => setActiveTab('upload')}
            >
              Upload Image
            </button>
          </div>
        </div>
      </header>

      {/* 2. Stats Grid */}
      <section style={{ padding: '1.5rem 1.5rem 0 1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-label">Total Vehicles</span>
            <span className="stat-value">{totalVehiclesCount}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--success)' }}>
              <CheckCircle2 size={12} /> Local DB Connected
            </div>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Pending Challans</span>
            <span className="stat-value">{pendingChallansCount}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--danger)' }}>
              <AlertTriangle size={12} /> Requires Action
            </div>
          </div>
          <div className="stat-card success">
            <span className="stat-label">Revenue Collected</span>
            <span className="stat-value">₹{totalPaidRevenue.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--success)' }}>
              <BadgeCheck size={12} /> Synced with Bank API
            </div>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Pending Fines</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>₹{totalPendingFines.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={12} /> Outstanding Receivables
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Dashboard Body */}
      <main className="dashboard-grid">
        
        {/* Left Panel: Camera & Terminals */}
        <div className="left-panel">
          
          {/* Main Tab Views */}
          {activeTab === 'dashboard' && (
            <div className="panel">
              <div className="panel-header">
                <h2><Camera size={18} className="text-primary" /> Active Highway Scanning Stream</h2>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Auto scan on change:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>ON</span>
                </div>
              </div>

              <div className="cam-grid">
                
                {/* The HUD Visual Scanner Frame */}
                <div className={`cam-feed-container ${isScanning ? 'scanning' : ''}`}>
                  <div className="feed-overlay-hud">
                    <div className="hud-pill">{activeScenario.name}</div>
                    <div className="hud-pill alert">SPEED: {activeScenario.speed} KM/H (LIMIT: 60)</div>
                  </div>
                  
                  {/* Bounding boxes overlay drawing */}
                  {!isScanning && activeScenario.canvasData && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
                      
                      {/* Bike box */}
                      {activeScenario.canvasData.bikeBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.bikeBbox.x}px`,
                          top: `${activeScenario.canvasData.bikeBbox.y}px`,
                          width: `${activeScenario.canvasData.bikeBbox.w}px`,
                          height: `${activeScenario.canvasData.bikeBbox.h}px`,
                          border: '2px solid var(--primary)',
                          boxShadow: '0 0 8px var(--primary-glow)'
                        }}>
                          <span style={{ position: 'absolute', top: '-18px', left: '-2px', background: 'var(--primary)', color: '#fff', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.bikeBbox.label}
                          </span>
                        </div>
                      )}

                      {/* Plate box */}
                      {activeScenario.canvasData.plateBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.plateBbox.x}px`,
                          top: `${activeScenario.canvasData.plateBbox.y}px`,
                          width: `${activeScenario.canvasData.plateBbox.w}px`,
                          height: `${activeScenario.canvasData.plateBbox.h}px`,
                          border: '2px solid var(--accent)',
                          boxShadow: '0 0 8px rgba(0, 242, 254, 0.4)'
                        }}>
                          <span style={{ position: 'absolute', bottom: '-18px', left: '-2px', background: 'var(--accent)', color: '#000', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.plateBbox.label}
                          </span>
                        </div>
                      )}

                      {/* Helmet Violation box */}
                      {activeScenario.canvasData.headBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.headBbox.x}px`,
                          top: `${activeScenario.canvasData.headBbox.y}px`,
                          width: `${activeScenario.canvasData.headBbox.w}px`,
                          height: `${activeScenario.canvasData.headBbox.h}px`,
                          border: `2px dashed ${activeScenario.canvasData.headBbox.color}`,
                          boxShadow: '0 0 10px rgba(255, 23, 68, 0.5)'
                        }}>
                          <span style={{ position: 'absolute', top: '-18px', left: '-2px', background: activeScenario.canvasData.headBbox.color, color: '#fff', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.headBbox.label}
                          </span>
                        </div>
                      )}

                      {/* Triple Riding Violation box */}
                      {activeScenario.canvasData.ridersBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.ridersBbox.x}px`,
                          top: `${activeScenario.canvasData.ridersBbox.y}px`,
                          width: `${activeScenario.canvasData.ridersBbox.w}px`,
                          height: `${activeScenario.canvasData.ridersBbox.h}px`,
                          border: `2px dashed ${activeScenario.canvasData.ridersBbox.color}`,
                          boxShadow: '0 0 10px rgba(255, 23, 68, 0.5)'
                        }}>
                          <span style={{ position: 'absolute', top: '-18px', left: '-2px', background: activeScenario.canvasData.ridersBbox.color, color: '#fff', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.ridersBbox.label}
                          </span>
                        </div>
                      )}

                      {/* Phone Violation box */}
                      {activeScenario.canvasData.phoneBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.phoneBbox.x}px`,
                          top: `${activeScenario.canvasData.phoneBbox.y}px`,
                          width: `${activeScenario.canvasData.phoneBbox.w}px`,
                          height: `${activeScenario.canvasData.phoneBbox.h}px`,
                          border: `2px dashed ${activeScenario.canvasData.phoneBbox.color}`,
                          boxShadow: '0 0 10px rgba(255, 23, 68, 0.5)'
                        }}>
                          <span style={{ position: 'absolute', top: '-18px', left: '-2px', background: activeScenario.canvasData.phoneBbox.color, color: '#fff', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.phoneBbox.label}
                          </span>
                        </div>
                      )}

                      {/* Speed Indicator indicator box */}
                      {activeScenario.canvasData.speedIndicator && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.speedIndicator.x}px`,
                          top: `${activeScenario.canvasData.speedIndicator.y}px`,
                          width: `${activeScenario.canvasData.speedIndicator.w}px`,
                          height: `${activeScenario.canvasData.speedIndicator.h}px`,
                          border: `2px solid ${activeScenario.canvasData.speedIndicator.color}`,
                          background: 'rgba(255, 23, 68, 0.1)',
                          boxShadow: '0 0 10px rgba(255, 23, 68, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 'bold', textAlign: 'center' }}>
                            {activeScenario.canvasData.speedIndicator.label}
                          </span>
                        </div>
                      )}

                      {/* Normal Helmet detected box */}
                      {activeScenario.canvasData.helmetBbox && (
                        <div style={{ 
                          position: 'absolute',
                          left: `${activeScenario.canvasData.helmetBbox.x}px`,
                          top: `${activeScenario.canvasData.helmetBbox.y}px`,
                          width: `${activeScenario.canvasData.helmetBbox.w}px`,
                          height: `${activeScenario.canvasData.helmetBbox.h}px`,
                          border: `2px solid ${activeScenario.canvasData.helmetBbox.color}`,
                          boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
                        }}>
                          <span style={{ position: 'absolute', top: '-18px', left: '-2px', background: activeScenario.canvasData.helmetBbox.color, color: '#fff', fontSize: '0.62rem', padding: '1px 5px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            {activeScenario.canvasData.helmetBbox.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic OCR scanner display on canvas */}
                  {isScanning && (
                    <div style={{ position: 'absolute', zIndex: 15, background: 'rgba(0,0,0,0.85)', padding: '15px 30px', borderRadius: '8px', border: '1px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Activity className="text-primary" size={24} style={{ animation: 'spin 2s linear infinite' }} />
                      <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>SCANNING LICENSE PLATE</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '4px' }}>
                        {scannedPlate || 'OCR INITIALIZING...'}
                      </span>
                    </div>
                  )}

                  {/* Draw highway lane details in background */}
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 10px' }}>
                    <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}></div>
                    <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}></div>
                  </div>

                  {/* Simulated Silhouette image using pure CSS drawing */}
                  <div style={{ position: 'relative', width: '220px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                    <Car size={100} className={activeScenario.violationDetected.length > 0 ? "text-danger" : "text-success"} style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.1))' }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#222', padding: '2px 8px', borderRadius: '4px', border: '1px solid #444', color: '#00f2fe', marginTop: '10px' }}>
                      {scannedPlate || activeScenario.defaultPlate}
                    </div>
                  </div>

                  <div className="hud-bottom">
                    <span className="hud-pill">{activeScenario.vehicleType}</span>
                  </div>
                </div>

                {/* Scenario select controls */}
                <div className="cam-selection-panel">
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Live Highway Cameras:</div>
                  {cameraScenarios.map((scen) => {
                    const hasViolation = scen.violationDetected.length > 0;
                    return (
                      <button 
                        key={scen.id}
                        className={`cam-select-btn ${activeScenario.id === scen.id ? 'active' : ''}`}
                        onClick={() => setActiveScenario(scen)}
                      >
                        <span className="cam-select-btn-title">
                          {scen.name}
                          <span className={`cam-select-btn-badge ${!hasViolation ? 'clear' : ''}`}>
                            {hasViolation ? `${scen.violationDetected.length} ALERT` : 'CLEARED'}
                          </span>
                        </span>
                        <span className="cam-select-btn-desc">{scen.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="panel">
              <div className="panel-header">
                <h2><Database size={18} className="text-primary" /> MySQL Database Console (Local Mock tables)</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click badges to toggle documents & trigger real-time AI changes</span>
              </div>

              {/* DB editor warning */}
              <div style={{ background: 'rgba(31, 142, 254, 0.05)', border: '1px solid var(--primary-glow)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} />
                <span><strong>Demo Presentation Tip:</strong> Try setting Ramesh Kumar's PUC Status to <strong>VALID</strong>, then select Karol Bagh Node camera on the Dashboard tab. You will see the AI dashboard automatically clear the vehicle from violation, demonstrating how database fields sync in real time!</span>
              </div>

              {/* MySQL Vehicles Table */}
              <div className="db-table-wrapper">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Owner</th>
                      <th>Model/Brand</th>
                      <th>DL Status</th>
                      <th>Insurance</th>
                      <th>PUC Status</th>
                      <th>Blacklisted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((veh) => (
                      <tr key={veh.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent)' }}>
                          {veh.licensePlate}
                        </td>
                        <td>
                          <div>{veh.owner.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DL: {veh.owner.licenseNumber}</div>
                        </td>
                        <td>{veh.brand} {veh.model}</td>
                        <td>
                          <span 
                            className={`status-badge ${veh.owner.licenseStatus.toLowerCase()}`}
                            onClick={() => handleToggleDocStatus(veh.id, 'licenseStatus')}
                          >
                            {veh.owner.licenseStatus === 'VALID' && <Check size={10} />}
                            {veh.owner.licenseStatus === 'EXPIRED' && <X size={10} />}
                            {veh.owner.licenseStatus === 'SUSPENDED' && <AlertTriangle size={10} />}
                            {veh.owner.licenseStatus}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${veh.insuranceStatus.toLowerCase()}`}
                            onClick={() => handleToggleDocStatus(veh.id, 'insuranceStatus')}
                          >
                            {veh.insuranceStatus === 'VALID' ? <Check size={10} /> : <X size={10} />}
                            {veh.insuranceStatus}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${veh.pucStatus.toLowerCase()}`}
                            onClick={() => handleToggleDocStatus(veh.id, 'pucStatus')}
                          >
                            {veh.pucStatus === 'VALID' ? <Check size={10} /> : <X size={10} />}
                            {veh.pucStatus}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${veh.isBlacklisted ? 'stolen' : 'valid'}`}
                            onClick={() => handleToggleDocStatus(veh.id, 'isBlacklisted')}
                          >
                            {veh.isBlacklisted ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Mock Vehicle Form */}
              <form onSubmit={handleAddVehicle} style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Add Custom Demo Vehicle Record
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Plate (e.g. MH 12 AB 9999)" 
                    value={newPlate} 
                    onChange={e => setNewPlate(e.target.value)} 
                    style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '0.75rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Owner Full Name" 
                    value={newOwnerName} 
                    onChange={e => setNewOwnerName(e.target.value)} 
                    style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '0.75rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Brand (e.g. Yamaha)" 
                    value={newBrand} 
                    onChange={e => setNewBrand(e.target.value)} 
                    style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '0.75rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Model (e.g. R15)" 
                    value={newModel} 
                    onChange={e => setNewModel(e.target.value)} 
                    style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '0.75rem' }}
                  />
                  <select 
                    value={newDLStatus} 
                    onChange={e => setNewDLStatus(e.target.value)} 
                    style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    <option value="VALID">DL Status: Valid</option>
                    <option value="EXPIRED">DL Status: Expired</option>
                    <option value="SUSPENDED">DL Status: Suspended</option>
                  </select>
                </div>
                <button type="submit" className="phone-btn" style={{ marginTop: '12px', width: '200px' }}>
                  Register Demo Vehicle
                </button>
              </form>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="panel">
              <div className="panel-header">
                <h2><Upload size={18} className="text-primary" /> Upload Image & Detect Bounding Boxes</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate real-time YOLO plate detection on custom files</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label className="upload-dropzone">
                    <Upload size={32} className="text-primary" />
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Drag and drop vehicle image</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {uploadedFileName && (
                    <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      Selected: <strong>{uploadedFileName}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '200px', overflow: 'hidden', position: 'relative' }}>
                  {uploadedImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img src={uploadedImage} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      
                      {/* Scanning HUD for uploaded image */}
                      {isScanning && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                            {scannedPlate || 'DETECTING PLATE...'}
                          </span>
                        </div>
                      )}

                      {!isScanning && (
                        // Draw static bounding boxes
                        <div style={{ position: 'absolute', top: '40%', left: '35%', width: '30%', height: '20%', border: '2px solid var(--accent)' }}>
                          <span style={{ position: 'absolute', bottom: '-18px', left: '-2px', background: 'var(--accent)', color: '#000', fontSize: '0.55rem', padding: '1px 4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            PLATE DETECTED: {scannedPlate}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No image uploaded yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Terminal Console Logs */}
          <div className="log-terminals">
            {/* AI Service Terminal */}
            <div className="terminal-box">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                </div>
                <span>ai_service - Python (YOLOv8 + PaddleOCR)</span>
                <span style={{ color: 'var(--success)' }}>PORT 8000</span>
              </div>
              <div className="terminal-body" style={{ color: '#00ff66' }}>
                {aiLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>[SYSTEM] AI Service Ready. Select camera stream above to trigger AI inference logs...</p>
                ) : (
                  aiLogs.map((log, idx) => <div key={idx}>{log}</div>)
                )}
                <div ref={aiTerminalEndRef} />
              </div>
            </div>

            {/* Spring Boot Backend Terminal */}
            <div className="terminal-box">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                  <span className="terminal-dot"></span>
                </div>
                <span>backend_service - Spring Boot REST API</span>
                <span style={{ color: 'var(--primary)' }}>PORT 8080</span>
              </div>
              <div className="terminal-body" style={{ color: '#e5e9f0' }}>
                {backendLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>[SYSTEM] Spring Boot API Gateway Ready. SQL Connection pool active.</p>
                ) : (
                  backendLogs.map((log, idx) => <div key={idx}>{log}</div>)
                )}
                <div ref={backendTerminalEndRef} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Traffic Police Mobile App (Flutter Emulator) */}
        <div className="phone-panel">
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>
            Traffic Police Mobile App Emulator (Flutter)
          </div>
          
          <div className="mobile-phone-frame">
            <div className="phone-notch">
              <span className="phone-camera-dot"></span>
            </div>
            
            <div className="phone-screen">
              {/* Flutter App Header */}
              <div className="phone-app-bar">
                <Shield size={14} className="text-primary" />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Smart Police Asst. v1.2</span>
                <span style={{ width: '14px' }}></span>
              </div>

              {/* Lookup search section */}
              <div className="phone-card">
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  OCR SEARCH PORTAL
                </div>
                <div className="phone-input-group">
                  <input 
                    type="text" 
                    className="phone-input" 
                    placeholder="Plate: TN 38 AB 1234"
                    value={mobileSearchPlate}
                    onChange={e => setMobileSearchPlate(e.target.value)}
                  />
                  <button className="phone-btn" onClick={() => handleMobileLookup(mobileSearchPlate)}>
                    <Search size={14} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="phone-btn" 
                    style={{ flex: 1, background: '#222', border: '1px solid var(--border-color)', fontSize: '0.65rem', padding: '6px' }}
                    onClick={() => {
                      setMobileSearchPlate("TN-38-AB-1234");
                      handleMobileLookup("TN-38-AB-1234");
                    }}
                  >
                    Load TN-38
                  </button>
                  <button 
                    className="phone-btn" 
                    style={{ flex: 1, background: '#222', border: '1px solid var(--border-color)', fontSize: '0.65rem', padding: '6px' }}
                    onClick={() => {
                      setMobileSearchPlate("KA-51-MB-9999");
                      handleMobileLookup("KA-51-MB-9999");
                    }}
                  >
                    Load KA-51
                  </button>
                </div>
              </div>

              {/* Scan Lookup Results */}
              {mobileResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Owner Header */}
                  <div className="phone-card" style={{ background: 'rgba(31, 142, 254, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <User size={16} className="text-primary" />
                      <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{mobileResult.owner.name}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Vehicle: <strong>{mobileResult.brand} {mobileResult.model}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Licence No: {mobileResult.owner.licenseNumber}
                    </div>
                  </div>

                  {/* Document Badges */}
                  <div className="phone-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      GOVERNMENT API CHECK
                    </div>

                    <div className="phone-doc-status">
                      <span>Insurance status</span>
                      <span className={`badge ${mobileResult.insuranceStatus === 'VALID' ? 'text-success' : 'text-danger'}`}>
                        {mobileResult.insuranceStatus}
                      </span>
                    </div>

                    <div className="phone-doc-status">
                      <span>Pollution Certificate (PUC)</span>
                      <span className={`badge ${mobileResult.pucStatus === 'VALID' ? 'text-success' : 'text-danger'}`}>
                        {mobileResult.pucStatus}
                      </span>
                    </div>

                    <div className="phone-doc-status">
                      <span>Driving Licence Status</span>
                      <span className={`badge ${mobileResult.owner.licenseStatus === 'VALID' ? 'text-success' : (mobileResult.owner.licenseStatus === 'EXPIRED' ? 'text-danger' : 'text-warning')}`}>
                        {mobileResult.owner.licenseStatus}
                      </span>
                    </div>

                    <div className="phone-doc-status">
                      <span>Road Tax Status</span>
                      <span className={`badge ${mobileResult.roadTaxStatus === 'VALID' ? 'text-success' : 'text-danger'}`}>
                        {mobileResult.roadTaxStatus}
                      </span>
                    </div>

                    <div className="phone-doc-status">
                      <span>Blacklisted or Stolen</span>
                      <span className={`badge ${mobileResult.isBlacklisted ? 'text-danger' : 'text-success'}`}>
                        {mobileResult.isBlacklisted ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>

                  {/* Challans List */}
                  <div className="phone-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      PENDING CHALLANS
                    </div>
                    
                    {challans.filter(c => c.vehiclePlate === mobileResult.licensePlate).length === 0 ? (
                      <div style={{ fontSize: '0.7rem', color: 'var(--success)', padding: '4px 0' }}>
                        No pending violations on record.
                      </div>
                    ) : (
                      challans
                        .filter(c => c.vehiclePlate === mobileResult.licensePlate)
                        .map((c) => (
                          <div className="phone-challan-item" key={c.id}>
                            <div>
                              <div>{c.violationType}</div>
                              <div style={{ fontSize: '0.6rem', color: c.status === 'PENDING' ? 'var(--warning)' : 'var(--success)' }}>
                                {c.status}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 'bold', color: c.status === 'PENDING' ? 'var(--danger)' : 'var(--success)' }}>₹{c.fineAmount}</span>
                              {c.status === 'PENDING' ? (
                                <button 
                                  style={{ background: 'var(--success)', border: 'none', color: '#000', borderRadius: '4px', fontSize: '0.55rem', padding: '2px 4px', cursor: 'pointer', fontWeight: 'bold' }}
                                  onClick={() => handlePayChallan(c.id)}
                                >
                                  PAY
                                </button>
                              ) : (
                                <button 
                                  style={{ background: '#222', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', fontSize: '0.55rem', padding: '2px 4px', cursor: 'pointer' }}
                                  onClick={() => handlePrintReceipt(c)}
                                >
                                  PRINT
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Issue New Challan manually */}
                  <div className="phone-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      ISSUE MANUAL E-CHALLAN
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <select 
                        value={manualChallanType}
                        onChange={e => {
                          setManualChallanType(e.target.value);
                          const schema = { "No Helmet": 500, "Triple Riding": 1000, "Mobile Phone Usage": 1500, "Speeding": 2000, "PUC Expired": 1000 };
                          setManualFine(schema[e.target.value] || 500);
                        }}
                        style={{ flex: 1, background: '#0d0f14', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', fontSize: '0.7rem' }}
                      >
                        <option value="No Helmet">No Helmet (₹500)</option>
                        <option value="Triple Riding">Triple Riding (₹1000)</option>
                        <option value="Mobile Phone Usage">Mobile Phone Usage (₹1500)</option>
                        <option value="Speeding">Speeding (₹2000)</option>
                        <option value="PUC Expired">PUC Expired (₹1000)</option>
                      </select>
                      <button className="phone-btn" style={{ padding: '6px 10px' }} onClick={handleCreateManualChallan}>
                        ISSUE
                      </button>
                    </div>
                  </div>

                  {/* Action recommendation */}
                  {challans.some(c => c.vehiclePlate === mobileResult.licensePlate && c.status === 'PENDING') || 
                   mobileResult.insuranceStatus === 'EXPIRED' || mobileResult.pucStatus === 'EXPIRED' || mobileResult.owner.licenseStatus !== 'VALID' || mobileResult.isBlacklisted ? (
                    
                    <div style={{ background: 'rgba(255, 23, 68, 0.12)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', marginTop: 'auto', marginBottom: '10px' }}>
                      <AlertTriangle size={14} />
                      <div>
                        <strong>RECOMMENDATION: ISSUE CHALLAN</strong>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.8)' }}>Expired documents or unpaid fines detected.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(0, 230, 118, 0.12)', border: '1px solid var(--success)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', marginTop: 'auto', marginBottom: '10px' }}>
                      <CheckCircle2 size={14} />
                      <div>
                        <strong>RECOMMENDATION: ALLOW VEHICLE PASS</strong>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.8)' }}>All documents check out successfully.</div>
                      </div>
                    </div>
                  )}

                  {/* Print Challan Trigger */}
                  <button 
                    className="phone-btn danger" 
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => {
                      const firstPending = challans.find(c => c.vehiclePlate === mobileResult.licensePlate && c.status === 'PENDING');
                      if (firstPending) {
                        handlePrintReceipt(firstPending);
                      } else {
                        // Print mock pass slip
                        handlePrintReceipt({
                          id: Date.now(),
                          vehiclePlate: mobileResult.licensePlate,
                          ownerName: mobileResult.owner.name,
                          violationType: "COMPLIANCE VEHICLE PASS",
                          fineAmount: 0,
                          status: "APPROVED"
                        });
                      }
                    }}
                  >
                    <Printer size={12} style={{ marginRight: '6px' }} />
                    GENERATE E-CHALLAN / PASS
                  </button>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-muted)', gap: '10px', textAlign: 'center', padding: '20px' }}>
                  <Cpu size={32} />
                  <p style={{ fontSize: '0.75rem' }}>No scanning profile loaded. Enter plate number or scan using dashboard cameras.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* 4. Thermal Receipt Modal for Printing Simulation */}
      {receiptChallan && (
        <div className="receipt-overlay">
          <div className="receipt-modal">
            <div className="thermal-paper">
              <div className="receipt-header">
                <h3>E-CHALLAN RECEIPT</h3>
                <p>TRAFFIC POLICE DEPARTMENT</p>
                <p style={{ fontSize: '0.65rem' }}>GOVT. OF NATIONAL TERRITORY</p>
              </div>

              <div className="receipt-row">
                <span>Receipt ID:</span>
                <span>CH-{receiptChallan.id}</span>
              </div>
              <div className="receipt-row">
                <span>Date:</span>
                <span>{new Date(receiptChallan.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="receipt-row">
                <span>Time:</span>
                <span>{new Date(receiptChallan.createdAt || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

              <div className="receipt-row">
                <strong>PLATE NO:</strong>
                <strong>{receiptChallan.vehiclePlate}</strong>
              </div>
              <div className="receipt-row">
                <span>Owner Name:</span>
                <span>{receiptChallan.ownerName}</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>VIOLATION DETAILS:</div>
              <div className="receipt-row" style={{ fontSize: '0.8rem', paddingLeft: '8px' }}>
                <span>* {receiptChallan.violationType}</span>
                <span>₹{receiptChallan.fineAmount}</span>
              </div>

              <div style={{ borderBottom: '2px dashed #000', margin: '12px 0' }}></div>
              <div className="receipt-row" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                <span>TOTAL FINE:</span>
                <span>₹{receiptChallan.fineAmount}</span>
              </div>
              <div className="receipt-row">
                <span>Status:</span>
                <span style={{ fontWeight: 'bold' }}>{receiptChallan.status}</span>
              </div>

              <div className="receipt-footer">
                <p>Scan QR code below to pay fine online within 15 days.</p>
                {/* QR code mock */}
                <div style={{ width: '80px', height: '80px', background: '#000', margin: '10px auto', display: 'flex', flexWrap: 'wrap', border: '4px solid #fff' }}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} style={{ width: '20px', height: '20px', background: (i*7 + 3) % 2 === 0 ? '#fff' : '#000' }}></div>
                  ))}
                </div>
                <p style={{ fontSize: '0.55rem', marginTop: '6px' }}>Safe journey. Wear a helmet at all times.</p>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="receipt-btn print" onClick={executeBrowserPrint}>Print Receipt</button>
              <button className="receipt-btn close" onClick={() => setReceiptChallan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
