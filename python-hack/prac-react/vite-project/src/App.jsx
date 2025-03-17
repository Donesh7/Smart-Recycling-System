import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Recycle, Award, Play, Square, ArrowRight, Leaf, Droplets, BarChart3, User } from "lucide-react";
import { io } from "socket.io-client";

// Initialize socket connection
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [userId, setUserId] = useState("");
  const [frame, setFrame] = useState("");
  const [bottleCount, setBottleCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [isDetectionStarted, setIsDetectionStarted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [connectionError, setConnectionError] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Added for socket connection status

  // Environmental impact calculations
  const plasticSaved = bottleCount * 15; // grams
  const waterSaved = bottleCount * 3; // liters
  const co2Reduced = bottleCount * 0.08; // kg

  // Handle entering user ID
  const handleEnterUserId = () => {
    if (!userId) {
      alert("Please enter a User ID.");
      return;
    }
    setIsDetectionStarted(true);
  };

  // Toggle tutorial visibility
  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };

  // Start detection
  const startDetection = () => {
    socket.emit("start", { objectId: userId });
    setIsDetecting(true);
  };

  // Stop detection
const stopDetection = () => {
  socket.emit("stop");  // Stop the detection process
  socket.emit("reset_impact");  // Emit event to reset impact metrics
  setIsDetecting(false);  // Update state to reflect that detection has stopped
  setBottleCount(0);  // Reset bottle count to 0
};

  // Listen for updates from the backend
  useEffect(() => {
    socket.on("update", (data) => {
      const count = Number(data.bottle_count);
      if (!isNaN(count)) {
        setBottleCount(count);
        setPoints(count * 10);
      }
      if (data.frame) {
        setFrame(data.frame);
      }
    });

    return () => {
      socket.off("update");
    };
  }, []);

  // Socket connection status
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true); // Set connection status
      setConnectionError(false);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionError(true);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <motion.header className="app-header">
        <div className="container app-header-content">
          <motion.div className="app-header-left">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
              <Recycle size={24} className="text-white" />
            </motion.div>
            <motion.h1 className="app-title">EcoScan</motion.h1>
          </motion.div>
          {isDetectionStarted && (
            <div className="app-header-right">
              <motion.div className="user-info">
                <User size={16} />
                <span>{userId}</span>
              </motion.div>
              <motion.div className="points-info">
                <Award size={16} />
                <span>{points} Points</span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container app-main">
        {!isDetectionStarted ? (
          <motion.div className="welcome-card">
            <div className="welcome-card-content">
              <motion.div className="welcome-card-image-container">
                <motion.img
                  src="src/image.jpg"
                  alt="Plastic recycling"
                  className="welcome-card-image"
                />
              </motion.div>
              <motion.div className="welcome-card-text">
                <motion.div className="welcome-card-header">
                  <Recycle className="text-emerald-600" size={isMobile ? 20 : 24} />
                  <h2 className="welcome-card-title">Welcome to EcoScan</h2>
                </motion.div>
                <motion.p className="welcome-card-description">
                  Join our mission to reduce plastic waste and earn rewards for your eco-friendly actions.
                </motion.p>
                <motion.div className="welcome-card-form">
                  <div>
                    <motion.label htmlFor="userId" className="form-label">
                      Enter Your User ID
                    </motion.label>
                    <motion.input
                      type="text"
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g., eco123"
                      className="form-input"
                    />
                  </div>
                  <div className="welcome-card-buttons">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.5)" }}
                      onClick={handleEnterUserId}
                      className="start-recycling-button"
                    >
                      <ArrowRight size={18} />
                      Start Recycling
                    </motion.button>
                    <motion.button onClick={toggleTutorial} className="tutorial-link">
                      How does it work?
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="main-grid">
            {/* Left Column - Camera Feed */}
            <div className="camera-column">
              <motion.div className="camera-card">
                <motion.div className="camera-header">
                  <motion.h2 className="camera-title">
                    <Recycle size={isMobile ? 20 : 20} />
                    Plastic Bottle Detection
                  </motion.h2>
                  <div className="camera-buttons">
                    {!isDetecting ? (
                      <motion.button
                        whileHover={{ scale: 1.08, boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4)" }}
                        onClick={startDetection}
                        className="start-button"
                      >
                        <Play size={16} />
                        Start
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.08, boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)" }}
                        onClick={stopDetection}
                        className="stop-button"
                      >
                        <Square size={16} />
                        Stop
                      </motion.button>
                    )}
                  </div>
                </motion.div>
                <motion.div className="camera-content">
                  <motion.div className="video-feed-container">
                    {frame ? (
                      <motion.img src={`data:image/jpeg;base64,${frame}`} alt="Video Feed" className="video-feed" />
                    ) : (
                      <motion.div className="no-feed">
                        <Recycle size={isMobile ? 40 : 48} className="no-feed-icon" />
                        <motion.p className="no-feed-text">
                          {isDetecting ? "Waiting for camera feed..." : "Click 'Start' to begin detection"}
                        </motion.p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column - Stats */}
            <div className="stats-column">
              <motion.div className="stats-card">
                <motion.div className="stats-header">
                  <motion.h2 className="stats-title">
                    <BarChart3 size={isMobile ? 18 : 20} />
                    Your Impact
                  </motion.h2>
                </motion.div>
                <motion.div className="stats-content">
                  <motion.div className="bottle-count-container">
                    <motion.div className="bottle-count-circle">
                      <motion.div className="bottle-count-number">{bottleCount}</motion.div>
                      <motion.div className="bottle-count-label">Bottles</motion.div>
                    </motion.div>
                  </motion.div>
                  <motion.div className="impact-metrics">
                    <motion.div className="impact-item">
                      <Award size={isMobile ? 18 : 20} />
                      <div>
                        <motion.div className="impact-label">Points Earned</motion.div>
                        <motion.div className="impact-value">{points}</motion.div>
                      </div>
                    </motion.div>
                    <motion.div className="impact-item">
                      <Recycle size={isMobile ? 18 : 20} />
                      <div>
                        <motion.div className="impact-label">Plastic Saved</motion.div>
                        <motion.div className="impact-value">{plasticSaved}g</motion.div>
                      </div>
                    </motion.div>
                    <motion.div className="impact-item">
                      <Droplets size={isMobile ? 18 : 20} />
                      <div>
                        <motion.div className="impact-label">Water Saved</motion.div>
                        <motion.div className="impact-value">{waterSaved}L</motion.div>
                      </div>
                    </motion.div>
                    <motion.div className="impact-item">
                      <Leaf size={isMobile ? 18 : 20} />
                      <div>
                        <motion.div className="impact-label">CO₂ Reduced</motion.div>
                        <motion.div className="impact-value">{co2Reduced.toFixed(2)}kg</motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;