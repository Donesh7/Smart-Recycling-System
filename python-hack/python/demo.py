import cv2
from ultralytics import YOLO
import base64
import time
import threading
from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import atexit
import signal
import sys

# Create the Flask app instance
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Initialize SocketIO
socketio = SocketIO(app, async_mode='gevent', cors_allowed_origins="http://localhost:5173")

# MongoDB connection with SSL/TLS
try:
    client = MongoClient(
        "mongodb+srv://duvvuruvarundonesh:cHinnu54321@varundonesh.3ys9c.mongodb.net/?retryWrites=true&w=majority&appName=VarunDonesh",
        tls=True,  
        tlsAllowInvalidCertificates=True 
    )
    db = client["object_detection"]
    collection = db["detected_objects"]
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    exit(1)

model = YOLO("yolov8n.pt")

# Global variables for camera and detection
camera = None
is_running = False
current_object_id = None
total_bottle_count = 0
detected_bottles = set()
last_detection_time = 0
new_bottles_detected = 0  

# Function to detect plastic bottles and draw bounding boxes
def detect_plastic_bottles(frame):
    global total_bottle_count, detected_bottles, new_bottles_detected

    results = model(frame, conf=0.5, iou=0.45) 
    current_bottles = set()  

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            label = result.names[class_id]
            if label == "bottle": 
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                bottle_id = f"{x1}_{y1}_{x2}_{y2}" 
                current_bottles.add(bottle_id)
                if bottle_id not in detected_bottles:
                    total_bottle_count += 1
                    new_bottles_detected += 1 
                    detected_bottles.add(bottle_id) 
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Bottle", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    detected_bottles.intersection_update(current_bottles)

    return frame, total_bottle_count

# Main function for real-time object detection
def detect_objects_thread():
    global camera, is_running, current_object_id, total_bottle_count, last_detection_time, new_bottles_detected

    while is_running:
        if camera is None or not camera.isOpened():
            print("Error: Camera not initialized.")
            break
        ret, frame = camera.read()
        if not ret:
            print("Error: Failed to read frame from camera.")
            break
        if (time.time() - last_detection_time) >= 3:
            frame, total_bottle_count = detect_plastic_bottles(frame)
            last_detection_time = time.time()

            # Save the total bottle count to MongoDB under the specified object Id
            if current_object_id:
                try:
                    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 

                    # Update MongoDB with objectId, total_bottle_count, and timestamp
                    collection.update_one(
                        {"objectId": current_object_id},
                        {
                            "$set": {
                                "total_bottle_count": total_bottle_count,
                                "timestamp": current_time 
                            },
                            "$inc": {
                                "total_recycled_bottles": new_bottles_detected  
                            }
                        },
                        upsert=True  
                    )
                    print(f"Saved total bottle count {total_bottle_count} for objectId {current_object_id} at {current_time} to MongoDB.")
                except Exception as e:
                    print(f"Failed to save bottle count to MongoDB: {e}")
                new_bottles_detected = 0
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')

        # Send frame and total bottle count to the frontend
        socketio.emit('update', {
            'frame': frame_base64,
            'bottle_count': total_bottle_count 
        })

        time.sleep(0.03) 
    if camera is not None:
        camera.release()
        print("Camera released.")
@app.route('/test-mongo', methods=['GET'])
def test_mongo():
    try:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        collection.insert_one({
            "objectId": "test",
            "total_bottle_count": 0,
            "total_recycled_bottles": 0,  
            "timestamp": current_time
        })
        return jsonify({"status": "success", "message": "Test document inserted into MongoDB."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/api/bottle-count/<objectId>', methods=['GET'])
def get_bottle_count(objectId):
    try:
        document = collection.find_one({"objectId": objectId}, {'_id': 0})
        if document:
            return jsonify({
                "status": "success",
                "total_bottle_count": document.get("total_bottle_count", 0),
                "total_recycled_bottles": document.get("total_recycled_bottles", 0),
                "timestamp": document.get("timestamp", "N/A") 
            })
        else:
            return jsonify({"status": "error", "message": "ObjectId not found."}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# WebSocket event to start detection
@socketio.on('start')
def start_detection(data):
    global camera, is_running, current_object_id, total_bottle_count, last_detection_time
    if not is_running:
        is_running = True
        current_object_id = data.get("objectId")
        if camera is None or not camera.isOpened():
            camera = cv2.VideoCapture(0) 
            if not camera.isOpened():
                print("Error: Could not open camera.")
                return
        threading.Thread(target=detect_objects_thread).start()

# WebSocket event to stop detection
@socketio.on('stop')
def stop_detection():
    global is_running, total_bottle_count, detected_bottles, new_bottles_detected
    is_running = False  
    total_bottle_count =0
    detected_bottles = set() 
    new_bottles_detected = 0  
    print("Detection stopped and impact metrics have been reset.")

# WebSocket event to reset impact metrics
@socketio.on('reset_impact')
def reset_impact():
    global total_bottle_count, detected_bottles, new_bottles_detected
    total_bottle_count = 0  
    detected_bottles = set()  
    new_bottles_detected = 0  
    print("Impact metrics have been reset.")
def cleanup():
    global camera, is_running
    if camera is not None and camera.isOpened():
        camera.release()
        print("Camera released during cleanup.")
    if is_running:
        is_running = False
        print("Detection stopped during cleanup.")
    print("Application is shutting down.")
atexit.register(cleanup)
def signal_handler(sig, frame):
    print("\nCtrl+C pressed. Shutting down gracefully...")
    cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Run the app with gevent
if __name__ == '__main__':
    try:
        socketio.run(app, debug=True, host='0.0.0.0', port=5000, use_reloader=False)
    except KeyboardInterrupt:
        print("\nServer is shutting down...")
        cleanup()
        sys.exit(0)