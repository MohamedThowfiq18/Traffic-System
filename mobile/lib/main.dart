import 'package:flutter/material';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const TrafficPoliceApp());
}

class TrafficPoliceApp extends StatelessWidget {
  const TrafficPoliceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Traffic Police',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.blueAccent,
        scaffoldBackgroundColor: const Color(0xFF121212),
        colorScheme: const ColorScheme.dark(
          primary: Colors.blueAccent,
          secondary: Colors.tealAccent,
        ),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final TextEditingController _plateController = TextEditingController();
  bool _isLoading = false;

  void _searchPlate(String plate) async {
    if (plate.isEmpty) return;
    setState(() => _isLoading = true);

    try {
      // In production, this targets the Spring Boot API
      final url = Uri.parse('http://10.0.2.2:8080/api/vehicles/$plate');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => VehicleDetailsScreen(
                vehicleData: data['vehicle'],
                challans: List<Map<String, dynamic>>.from(data['challans']),
              ),
            ),
          );
        }
      } else {
        _showError("Vehicle not found in database.");
      }
    } catch (e) {
      // Demo fallback if backend is offline during presentation
      _showDemoData(plate);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  void _showDemoData(String plate) {
    // Highly interactive fallback to demo offline capability
    final cleanPlate = plate.toUpperCase().trim();
    if (cleanPlate.contains("1234")) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const VehicleDetailsScreen(
            vehicleData: {
              "licensePlate": "TN 38 AB 1234",
              "brand": "Hero",
              "model": "Splendor Plus",
              "color": "Black-Red",
              "insuranceStatus": "VALID",
              "insuranceExpiry": "12-03-2027",
              "pucStatus": "EXPIRED",
              "pucExpiry": "15-06-2026",
              "roadTaxStatus": "VALID",
              "roadTaxExpiry": "20-10-2028",
              "isBlacklisted": false,
              "isStolen": false,
              "owner": {
                "name": "Ramesh Kumar",
                "licenseNumber": "DL-1420210098765",
                "licenseStatus": "VALID"
              }
            },
            challans: [
              {"violationType": "PUC Expired", "fineAmount": 1000.00, "status": "PENDING"},
              {"violationType": "No Helmet", "fineAmount": 500.00, "status": "PENDING"}
            ],
          ),
        ),
      );
    } else {
      _showError("No offline record for: $plate. Try 'TN-38-AB-1234' for demo.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Traffic Police Assistant'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            // App Banner/Logo
            const Center(
              child: Icon(Icons.security, size: 80, color: Colors.blueAccent),
            ),
            const SizedBox(height: 10),
            const Center(
              child: Text(
                'AI ANPR SCANNER & LOOKUP',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
              ),
            ),
            const SizedBox(height: 40),
            // Search Input
            TextField(
              controller: _plateController,
              decoration: InputDecoration(
                labelText: 'Enter Vehicle Number Plate',
                hintText: 'e.g. TN 38 AB 1234',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: Colors.blueAccent, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 15),
            ElevatedButton.icon(
              icon: _isLoading 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) 
                : const Icon(Icons.search),
              label: const Text('SEARCH VEHICLE'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                backgroundColor: Colors.blueAccent,
              ),
              onPressed: _isLoading ? null : () => _searchPlate(_plateController.text),
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 10),
            const Text("Quick Scan Simulation", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.camera_alt),
                    label: const Text("Scan License Plate"),
                    onPressed: () => _searchPlate("TN-38-AB-1234"),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}

class VehicleDetailsScreen extends StatelessWidget {
  final Map<String, dynamic> vehicleData;
  final List<Map<String, dynamic>> challans;

  const VehicleDetailsScreen({
    super.key,
    required this.vehicleData,
    required this.challans,
  });

  @override
  Widget build(BuildContext context) {
    final owner = vehicleData['owner'] ?? {"name": "Unknown", "licenseStatus": "UNKNOWN"};
    double totalFines = challans
        .where((c) => c['status'] == 'PENDING')
        .fold(0.0, (sum, c) => sum + (c['fineAmount'] as num).toDouble());

    // Evaluate PUC and Insurance
    bool insuranceValid = vehicleData['insuranceStatus'] == 'VALID';
    bool pucValid = vehicleData['pucStatus'] == 'VALID';
    bool licenseValid = owner['licenseStatus'] == 'VALID';

    return Scaffold(
      appBar: AppBar(
        title: Text(vehicleData['licensePlate'] ?? 'Vehicle Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vehicle Header
            Card(
              color: const Color(0xFF1E1E1E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    const CircleAvatar(
                      backgroundColor: Colors.blueAccent,
                      radius: 30,
                      child: Icon(Icons.motorcycle, size: 36, color: Colors.white),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "${vehicleData['brand']} ${vehicleData['model']}",
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          Text("Plate: ${vehicleData['licensePlate']}", style: TextStyle(color: Colors.grey[400])),
                          Text("Owner: ${owner['name']}", style: TextStyle(color: Colors.grey[400])),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            const Text("DOCUMENT STATUS", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            const SizedBox(height: 10),
            
            // Document Status Rows
            _buildStatusItem("Insurance", insuranceValid ? "Valid" : "Expired", insuranceValid),
            _buildStatusItem("PUC Status", pucValid ? "Valid" : "Expired", pucValid),
            _buildStatusItem("Driving License", owner['licenseStatus'], licenseValid),
            _buildStatusItem(
              "Blacklist Status", 
              vehicleData['isBlacklisted'] == true ? "BLACKLISTED" : "Clear", 
              vehicleData['isBlacklisted'] != true
            ),

            const SizedBox(height: 25),
            const Text("PENDING TRAFFIC CHALLANS", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
            const SizedBox(height: 10),

            challans.isEmpty
                ? const Card(
                    color: Color(0xFF1E1E1E),
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: Text("No pending violations.", style: TextStyle(color: Colors.green))),
                    ),
                  )
                : Column(
                    children: challans.map((c) {
                      return Card(
                        color: const Color(0xFF1E1E1E),
                        child: ListTile(
                          title: Text(c['violationType']),
                          subtitle: Text("Status: ${c['status']}", style: TextStyle(color: c['status'] == 'PENDING' ? Colors.amber : Colors.green)),
                          trailing: Text("₹${c['fineAmount']}", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                        ),
                      );
                    }).toList(),
                  ),

            const SizedBox(height: 30),
            
            // Recommendation
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: totalFines > 0 ? Colors.red.withOpacity(0.15) : Colors.green.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: totalFines > 0 ? Colors.redAccent : Colors.greenAccent),
              ),
              child: Row(
                children: [
                  Icon(
                    totalFines > 0 ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                    color: totalFines > 0 ? Colors.redAccent : Colors.greenAccent,
                    size: 30,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          totalFines > 0 ? "RECOMMENDATION: ISSUE CHALLAN" : "RECOMMENDATION: ALL CLEAR",
                          style: TextStyle(
                            color: totalFines > 0 ? Colors.redAccent : Colors.greenAccent,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          totalFines > 0 
                            ? "Vehicle has expired documents and pending fines of ₹$totalFines." 
                            : "All documents are in order. Let vehicle pass.",
                          style: const TextStyle(fontSize: 13),
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: totalFines > 0 ? Colors.redAccent : Colors.blueAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                // Trigger challan print action
              },
              child: Text(totalFines > 0 ? "GENERATE E-CHALLAN & PRINT" : "GENERATE PASS SLIP"),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusItem(String title, String value, bool isValid) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 15)),
            Row(
              children: [
                Icon(
                  isValid ? Icons.check_circle : Icons.cancel,
                  color: isValid ? Colors.green : Colors.red,
                  size: 18,
                ),
                const SizedBox(width: 6),
                Text(
                  value,
                  style: TextStyle(
                    color: isValid ? Colors.green : Colors.redAccent,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
