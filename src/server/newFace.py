# add_face.py
import cv2
import face_recognition
import os
import sys
import numpy as np # נדרש עבור map(float, encoding_str) ו-np.array

# הגדרת נתיבים
FACES_DIR = "faces"
FACES_DATA_FILE = os.path.join(FACES_DIR, "faces_data.txt")

def create_face_database_from_image(person_name, image_bytes):
    """
    יוצרת קידוד פנים עבור אדם נתון מתוך בייטים של תמונה
    ושומרת אותו במסד הנתונים (קובץ טקסט).
    מחזירה את הקידוד שנוסף (אם נמצא), או מעלה שגיאה.
    """
    # יצירת תיקייה לשמירת נתונים אם אינה קיימת
    if not os.path.exists(FACES_DIR):
        os.makedirs(FACES_DIR)

    try:
        # המרת בייטים של תמונה למערך NumPy ש-OpenCV יכול לקרוא
        np_image = np.frombuffer(image_bytes, np.uint8)
        img_cv2 = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        
        if img_cv2 is None:
            raise ValueError("לא ניתן לקרוא את קובץ התמונה. ייתכן שהוא פגום.")

        # המרת BGR ל-RGB (face_recognition מצפה ל-RGB)
        rgb_image = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2RGB)
        
        # חישוב קידודי הפנים בתמונה
        encodings = face_recognition.face_encodings(rgb_image)

        if len(encodings) > 0:
            face_encoding = encodings[0] # ניקח את הקידוד של הפנים הראשונות שנמצאו
            
            # שמירת הקידוד לקובץ faces_data.txt
            with open(FACES_DATA_FILE, "a") as f:
                encoding_str = ",".join(map(str, face_encoding))
                f.write(f"{person_name},{encoding_str}\n")
            
            return face_encoding # החזר את הקידוד שנוסף
        else:
            raise ValueError("לא נמצאו פנים בתמונה. אנא ודא שהפנים ברורות ובולטות.")
            
    except Exception as e:
        # הדפס שגיאה כללית וזרוק אותה שוב כדי שהקורא יוכל לטפל בה
        print(f"אירעה שגיאה ב-create_face_database_from_image: {e}")
        raise

if __name__ == "__main__":
    # זהו הקוד הישן שמאפשר להריץ את הסקריפט מהפקודה
    if len(sys.argv) < 3:
        print("יש לספק שם אדם ונתיב לתמונה כדי להוסיף למאגר.")
        print("שימוש: python add_face.py <שם_אדם> <נתיב_לתמונה>")
        print("לדוגמה: python add_face.py Chani pictures/chani.jpg")
        sys.exit(1)
    
    person_name_arg = sys.argv[1]
    image_path_arg = sys.argv[2]
    
    # טעינת התמונה מקובץ עבור הרצה מקומית
    try:
        with open(image_path_arg, 'rb') as f:
            image_bytes_arg = f.read()
        
        create_face_database_from_image(person_name_arg, image_bytes_arg)
        print(f"קידוד פנים עבור '{person_name_arg}' נשמר בהצלחה מתוך התמונה '{image_path_arg}'.")
    except FileNotFoundError:
        print(f"שגיאה: הקובץ '{image_path_arg}' לא נמצא. אנא ודא שהנתיב נכון.")
    except ValueError as ve:
        print(f"שגיאת קלט: {ve}")
    except Exception as e:
        print(f"שגיאה כללית בהרצה: {e}")