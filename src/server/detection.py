# detection.py
import cv2
import face_recognition
import numpy as np
import os

# הגדרת נתיבים
FACES_DIR = "faces"
FACES_DATA_FILE = os.path.join(FACES_DIR, "faces_data.txt")
# יצירת התיקייה אם לא קיימת
if not os.path.exists(FACES_DIR):
    os.makedirs(FACES_DIR)

# יצירת הקובץ הריק אם אינו קיים
if not os.path.exists(FACES_DATA_FILE):
    with open(FACES_DATA_FILE, "w", encoding="utf-8") as f:
        pass  #  יוצר קובץ ריק

def load_known_faces_data():
    """טוען את קידודי הפנים הידועים ואת השמות מקובץ faces_data.txt."""
    known_face_encodings = []
    known_face_names = []
    
    if not os.path.exists(FACES_DATA_FILE):
        # מדפיס אזהרה, אבל לא מעלה שגיאה כדי לאפשר התחלה ללא קובץ
        print(f"אזהרה: קובץ מסד הנתונים '{FACES_DATA_FILE}' לא נמצא ב-detection.py.")
        return [], [] # מחזיר רשימות ריקות

    try:
        with open(FACES_DATA_FILE, "r") as f:
            for line in f:
                try:
                    name, *encoding_str = line.strip().split(",")
                    encoding = np.array(list(map(float, encoding_str)))
                    known_face_encodings.append(encoding)
                    known_face_names.append(name)
                except ValueError:
                    print(f"שגיאה בניתוח קידוד עבור שורה: {line.strip()} ב-detection.py. מדלג.")
        return known_face_encodings, known_face_names
    except Exception as e:
        print(f"שגיאה בטעינת מסד הנתונים ב-detection.py: {e}")
        return [], [] # במקרה של שגיאה, מחזיר רשימות ריקות


def detect_and_recognize_face(image_bytes: bytes, known_encodings: list, known_names: list, admin_name: str):
    """
    מזהה פנים בתמונה נתונה (בפורמט בייטים) ומנסה לזהות אותן מול מאגר.
    מחזירה מילון עם שם הפנים המזוהות, האם זוהו, והאם זה המנהל.
    """
    try:
        np_image = np.frombuffer(image_bytes, np.uint8)
        img_cv2 = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        
        if img_cv2 is None:
            raise ValueError("לא ניתן לקרוא את קובץ התמונה. ייתכן שהוא פגום.")

        rgb_image = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

        if not face_encodings:
            return {"name": "No Face Found", "is_recognized": False, "is_admin": False, "face_location": None}
        
        # נניח שרק פנים אחת מעניינת אותנו לצורך זיהוי כניסה/אימות
        # אם יש יותר מפנים אחת, נשתמש רק בראשונה
        face_encoding = face_encodings[0]
        
        name = "Unknown"
        is_admin = False
        is_recognized = False

        if known_encodings: # רק אם יש פנים מוכרות במאגר
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.6)
            if True in matches:
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                name = known_names[best_match_index]
                is_recognized = True
                is_admin = (name == admin_name)

        return {
            "name": name, 
            "is_recognized": is_recognized, 
            "is_admin": is_admin,
            "face_location": {"top": face_locations[0][0], "right": face_locations[0][1], 
                              "bottom": face_locations[0][2], "left": face_locations[0][3]}
        }
    except Exception as e:
        print(f"שגיאה ב-detect_and_recognize_face: {e}")
        raise # נזרוק את השגיאה הלאה לשרת לטיפול