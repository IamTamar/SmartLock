from flask import Flask, request, jsonify
from detection import detect_and_recognize_face, load_known_faces_data
from newFace import create_face_database_from_image
import requests
from flask_cors import CORS
import os


app = Flask(__name__)
CORS(app)  # מאפשר לכל הדומיינים לשלוח בקשות

# קבועים
ESP32_CAMERA_URL = "http://192.168.1.1"  # כתובת ESP - לשנות לפי הצורך
ADMIN_NAME = "tamar"  # שם המנהל (לזיהוי בהרשאות)

@app.route("/start-camera", methods=["POST"])
# def start_camera():
#     try:
#         # שולח בקשה ל-ESP32 להפעיל את הזרם
#         esp_response = requests.get(`http://10.100.102.5`, timeout=10)
#         return jsonify({"status": "success", "message": "camera started"}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": f"Failed to contact ESP: {e}"}), 500


@app.route("/detect-face", methods=["POST"])
def detect_face():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "Missing image"}), 400

    image_file = request.files['image']
    image_bytes = image_file.read()

    known_encodings, known_names = load_known_faces_data()

    try:
        result = detect_and_recognize_face(
            image_bytes=image_bytes,
            known_encodings=known_encodings,
            known_names=known_names,
            admin_name=ADMIN_NAME
        )
        
        #שליחה לבקר ESP32, כדי שיידע אם להפעיל את הצפצפה , המנעול וכו'
        try:
            notify_esp32({
            "is_recognized": result["is_recognized"],
            "is_admin": result["is_admin"],
            "name": result["name"]
        })
        except Exception as e:
            print(f"שגיאה בשליחה ל-ESP32: {e}")

        return jsonify({
            "is_recognized": result["is_recognized"],
            "is_admin": result["is_admin"],
            "name": result["name"]
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Face detection failed: {e}"}), 500


@app.route("/users-list", methods=["GET"])
def users_list():
    users = []
    try:
        if os.path.exists("./faces/faces_data.txt"):
            with open("./faces/faces_data.txt", "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) >0:
                        name = parts[0]
                        if name not in users:
                            users.append(name)
        return jsonify({"users": users})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/add-face", methods=["POST"])
def addNewFace():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "לא נשלח קובץ תמונה"}), 400
    
    if 'name' not in request.form:
        return jsonify({"status": "error", "message": "חובה לצרף את שם האדם "}), 400

    image_file = request.files['image']
    person_name = request.form['name']

    # שם תקין
    if not person_name.strip():
        return jsonify({"status": "error", "message": "שם האדם לא יכול להיות ריק"}), 400
    try:
        image_bytes = image_file.read()
        # קוראים לפונקציה מתוך add_face.py
        newEncoding = create_face_database_from_image(person_name, image_bytes)
        
        if newEncoding is not None:
            return jsonify({
                "status": "success",
                "message": f"פנים עבור {person_name} נוספו בהצלחה.",
                "person_name": person_name
            }), 200
        else:
            return jsonify({"status": "error", "message": "לא ניתן להוסיף את הפנים. ודא שהתמונה ברורה."}), 500
    except ValueError as ve:
        # טיפול בשגיאות שהפונקציה create_face_database_from_image יכולה לזרוק (כמו "לא נמצאו פנים")
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        # טיפול בשגיאות כלליות
        print(f"שגיאה ב-add_new_face endpoint: {e}")
        return jsonify({"status": "error", "message": "אירעה שגיאה בשרת במהלך הוספת הפנים."}), 500


#שליחת פרמטרים לבקר , האם זוהה או לא
def notify_esp32(result):
    esp32_ip = "http://10.100.102.8"  # כתובת ה-IP של ה-ESP שלך

    try:
        params = {
            "is_recognized": int(result["is_recognized"]),
            "is_admin": int(result["is_admin"])
        }
        requests.get(f"{esp32_ip}/access", params=params, timeout=10)
    except Exception as e:
        print("שגיאה בשליחת פקודה ל-ESP:", e)

if __name__ == "__main__":
    app.run(debug=True)
