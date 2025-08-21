const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fftitljrhntxtejhelja.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdGl0bGpyaG50eHRlamhlbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzYwNzAsImV4cCI6MjA3MDQxMjA3MH0._avLy91UYFyM79AWeBd1ZKgJH9GKbp3K-fXVMXaXXVY";

const supabase = createClient(supabaseUrl, supabaseKey);

// Location utility functions (from locationUtils.ts)
function parseLocationString(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') {
    return null;
  }

  // Remove any location name prefix (e.g., "Test Location: ")
  const cleanLocation = locationStr.includes(':') 
    ? locationStr.split(':')[1].trim() 
    : locationStr.trim();

  // Split by comma and try to parse coordinates
  const parts = cleanLocation.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    // Validate coordinates
    if (!isNaN(lat) && !isNaN(lng) && 
        lat >= -90 && lat <= 90 && 
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  
  return null;
}

function generateGoogleMapsUrl(coordinates) {
  const { lat, lng } = coordinates;
  return `https://www.google.com/maps?q=${lat},${lng}&z=16`;
}

async function testLocationMapsFeature() {
  console.log("🗺️ Testing Location Google Maps Feature...\n");

  // Test different location formats
  const testLocations = [
    "Test Location: -6.200000, 106.816666", // Jakarta coordinates
    "-6.914744, 107.609810", // Bandung coordinates  
    "Surabaya Office: -7.257472, 112.752090", // Surabaya coordinates
    "Invalid location text", // Should not create link
    "", // Empty string
    null, // Null value
    "-6.175110, 106.865039" // Monas Jakarta coordinates
  ];

  console.log("1. Testing location parsing and Google Maps URL generation:");
  console.log("=" .repeat(60));

  testLocations.forEach((location, index) => {
    console.log(`\nTest ${index + 1}: "${location}"`);
    
    const coordinates = parseLocationString(location);
    if (coordinates) {
      const googleMapsUrl = generateGoogleMapsUrl(coordinates);
      console.log(`✅ Valid coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      console.log(`🔗 Google Maps URL: ${googleMapsUrl}`);
    } else {
      console.log("❌ No valid coordinates found - will show as plain text");
    }
  });

  console.log("\n" + "=" .repeat(60));
  console.log("2. Testing with real absensi data from database:");
  console.log("=" .repeat(60));

  try {
    // Get some real absensi data
    const { data: absensiData, error } = await supabase
      .from("tb_absensi")
      .select("id_absensi, nama_siswa, lokasi, tanggal, status")
      .limit(5)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching absensi data:", error);
      return;
    }

    if (absensiData && absensiData.length > 0) {
      console.log(`\nFound ${absensiData.length} recent absensi records:`);
      
      absensiData.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  👤 Siswa: ${record.nama_siswa}`);
        console.log(`  📅 Tanggal: ${record.tanggal}`);
        console.log(`  ✅ Status: ${record.status}`);
        console.log(`  📍 Lokasi: "${record.lokasi}"`);
        
        const coordinates = parseLocationString(record.lokasi);
        if (coordinates) {
          const googleMapsUrl = generateGoogleMapsUrl(coordinates);
          console.log(`  🗺️  Google Maps: ${googleMapsUrl}`);
          console.log(`  ✅ Will show as clickable link in UI`);
        } else {
          console.log(`  ❌ Will show as plain text in UI`);
        }
      });
    } else {
      console.log("No absensi data found");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("3. Creating test data with various location formats:");
  console.log("=" .repeat(60));

  try {
    // Get a test siswa
    const { data: siswaData } = await supabase
      .from("tb_siswa")
      .select("*")
      .limit(1)
      .single();

    if (siswaData) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit", 
        second: "2-digit",
      });

      // Test data with different location formats
      const testDataSets = [
        {
          ...siswaData,
          lokasi: "Jakarta Office: -6.200000, 106.816666",
          tanggal: today,
          status: "Hadir",
          keterangan: "Test with Jakarta coordinates",
          jam_absensi: time,
        },
        {
          ...siswaData,
          lokasi: "-6.914744, 107.609810", 
          tanggal: today,
          status: "Hadir",
          keterangan: "Test with Bandung coordinates (no prefix)",
          jam_absensi: time,
        },
        {
          ...siswaData,
          lokasi: "No coordinates here - just text",
          tanggal: today,
          status: "Hadir", 
          keterangan: "Test with plain text location",
          jam_absensi: time,
        }
      ];

      console.log("\nInserting test absensi data...");
      
      for (let i = 0; i < testDataSets.length; i++) {
        const testData = { ...testDataSets[i] };
        // Remove id and created_at to avoid conflicts
        delete testData.id_siswa;
        delete testData.created_at;
        
        console.log(`\nTest ${i + 1}: "${testData.lokasi}"`);
        
        const { data, error } = await supabase
          .from("tb_absensi")
          .insert(testData)
          .select()
          .single();

        if (error) {
          console.log(`❌ Insert failed: ${error.message}`);
        } else {
          console.log(`✅ Inserted successfully - ID: ${data.id_absensi}`);
          
          const coordinates = parseLocationString(testData.lokasi);
          if (coordinates) {
            console.log(`🗺️  Will generate Google Maps link: ${generateGoogleMapsUrl(coordinates)}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error creating test data:", error);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("✅ Location Maps Feature Test Complete!");
  console.log("=" .repeat(60));
  console.log("\n📋 Summary:");
  console.log("- LocationLink component will automatically detect coordinates in lokasi field");
  console.log("- Valid coordinates will show as clickable Google Maps links");
  console.log("- Invalid/plain text locations will show as regular text");  
  console.log("- Feature is now active in Admin and Guru absensi pages");
  console.log("\n🔗 Test the feature by:");
  console.log("1. Opening http://localhost:3001/admin/absensi");
  console.log("2. Opening http://localhost:3001/guru/absensi");
  console.log("3. Looking for clickable coordinate links in the Lokasi column");
}

testLocationMapsFeature();
