const createTestAlert = async () => {
  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Set start time to current time and end time to 24 hours later
  const startTime = currentTime;
  const endTime = currentTime + 24 * 60 * 60; // 24 hours in seconds

  console.log("Creating test alert with times:", {
    startTime,
    endTime,
    currentTime,
  });

  const testAlert = {
    alert: {
      id: "2.49.0.0.428.0.LV.201201000201.46453_0",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [37.7749, -122.4194],
            [37.7749, -122.4094],
            [37.7649, -122.4094],
            [37.7649, -122.4194],
          ],
        ],
      },
    },
    msg_type: "warning",
    categories: ["Met"],
    urgency: "Future",
    severity: "Moderate",
    certainty: "Likely",
    start: startTime,
    end: endTime,
    sender: "AIRNow Program, US Environmental Protection Agency",
    description: [
      {
        language: "En",
        event:
          "Particle Pollution (2.5 microns) is forecast to reach 105 AQI - Unhealthy for Sensitive Groups",
        headline: "Air Quality Alert for Natomas",
        description:
          "Particle Pollution (2.5 microns) is forecast to reach 105 AQI - Unhealthy for Sensitive Groups",
        instruction:
          "Active children and adults, and people with lung disease, such as asthma, should reduce prolonged or heavy exertion outdoors",
      },
    ],
  };

  try {
    console.log("Sending alert to server...");
    const response = await fetch("http://localhost:3000/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alert: testAlert }),
    });

    const data = await response.json();
    console.log("Server response:", data);
  } catch (error) {
    console.error("Error creating test alert:", error);
  }
};

// Run the script
createTestAlert();
