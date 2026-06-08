async function runTests() {
  const baseUrl = 'http://localhost:3000/api';
  const endpoints = ['/inventory', '/menu', '/vendors', '/recipes', '/transactions'];
  let allPassed = true;

  console.log("Starting comprehensive API tests...\\n");

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing GET ${endpoint}...`);
      const res = await fetch(`${baseUrl}${endpoint}`);
      if (!res.ok) {
        console.error(`❌ FAILED ${endpoint}: HTTP ${res.status}`);
        allPassed = false;
        continue;
      }
      const data = await res.json();
      console.log(`✅ SUCCESS ${endpoint}: Retrieved ${data.length || (data.data && data.data.length) || 0} records.`);
    } catch (err) {
      console.error(`❌ ERROR ${endpoint}: ${err.message}`);
      allPassed = false;
    }
  }

  console.log("\\n--- Test Results ---");
  if (allPassed) {
    console.log("🎉 All core API functionalities are working perfectly!");
  } else {
    console.log("⚠️ Some API routes failed. Please review the logs above.");
  }
}

runTests();
