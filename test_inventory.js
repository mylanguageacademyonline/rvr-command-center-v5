const http = require("http");

// Helper to make POST requests
function postData(url, data) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(data);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": dataString.length,
      },
    };

    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk.toString());
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(dataString);
    req.end();
  });
}

// Helper to make GET requests
function getData(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk.toString());
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    }).on("error", reject);
  });
}

async function runTests() {
  try {
    console.log("Fetching current inventory...");
    const inventory = await getData("http://localhost:3001/api/inventory");
    
    if (!inventory || inventory.length === 0) {
      console.log("No inventory items found! Sync might have failed.");
      return;
    }

    console.log(`Found ${inventory.length} inventory items. Selecting 3 for testing...`);
    
    // Pick first 3 items
    const itemsToTest = inventory.slice(0, 3);
    
    for (const item of itemsToTest) {
      console.log(`Testing IN workflow for: ${item.itemName} (Current Stock: ${item.currentStock})`);
      const amountToAdd = Math.floor(Math.random() * 50) + 10; // Add between 10 and 60
      
      const res = await postData("http://localhost:3001/api/engine/in", {
        inventoryId: item._id,
        amountToAdd: amountToAdd
      });
      
      console.log(`SUCCESS: Added ${amountToAdd} to ${item.itemName}. New Stock: ${res.data.currentStock}\n`);
    }

    console.log("Testing complete! You can view the transactions in the Master Dashboard.");

  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

runTests();
