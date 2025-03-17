const axios = require("axios");

async function fetchDetectedObjects() {
  try {
    const response = await axios.get("/api/detected-objects");
    return response.data;
  } catch (error) {
    console.error("Error fetching detected objects:", error);
    throw error;
  }
}

module.exports = fetchDetectedObjects;
