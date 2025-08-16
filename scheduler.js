const schedule = require("node-cron");

// Schedule to run auto-alpha at 3:01 PM every day
schedule.schedule("1 15 * * *", async () => {
  try {
    const response = await fetch("http://localhost:3002/api/auto-alpha", {
      method: "POST",
    });
    const result = await response.json();
    console.log("Auto-alpha executed:", result);
  } catch (error) {
    console.error("Error running auto-alpha:", error);
  }
});

console.log("Auto-alpha scheduler started. Will run at 3:01 PM daily.");
console.log("Current time:", new Date().toLocaleString("id-ID"));

// Keep the process running
process.stdin.resume();
