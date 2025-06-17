import React, { useRef, useState } from "react";

function UserPanel({ goBack }) {
  const [faceVerified, setFaceVerified] = useState(false);
  const [showEspStream, setShowEspStream] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // הודעה למשתמש
  const imgRef = useRef(null);

  const handleFaceRecognition = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/start-camera", { method: "POST" });
      setShowEspStream(true);
      setTimeout(captureAndSendImage, 10000); // אחרי 10 שניות שולח תמונה לשרת
    } catch (error) {
      console.error("שגיאה בהפעלת מצלמה:", error);
    }
  };

  const captureAndSendImage = async () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = imgRef.current.width;
    canvas.height = imgRef.current.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const response = await fetch("http://localhost:5000/detect-face", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("זיהוי מהשרת:", result);

        if (result.is_recognized) {
          setFaceVerified(true);
          setMessage(`ברוכים הבאים, ${result.name}!`);
        } else {
          setFaceVerified(false);
          setMessage("לא נפתח – פנים לא זוהו.");
        }
      } catch (error) {
        console.error("שגיאה בשליחת תמונה לשרת:", error);
        setMessage("אירעה שגיאה בזיהוי הפנים.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
    },
    card: {
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 10,
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
    button: {
      padding: "10px 20px",
      fontSize: 16,
      borderRadius: 5,
      border: "none",
      backgroundColor: "#007bff",
      color: "#fff",
      cursor: "pointer",
      marginTop: 10,
    },
    backButton: {
      marginTop: 20,
      backgroundColor: "#ccc",
      color: "#000",
    },
    message: {
      marginTop: 15,
      fontWeight: "bold",
      color: faceVerified ? "green" : "red",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>כניסת משתמש</h2>

        {!faceVerified ? (
          <>
            {showEspStream ? (
              <>
                <img
                  ref={imgRef}
                  id="espStream"
                  src="http://192.168.1.1" // להחליף לכתובת של ESP
                  alt="ESP Camera"
                  width="250"
                  height="200"
                  style={{ borderRadius: 8, margin: "10px 0" }}
                />
                {loading && <p>מזהה פנים...</p>}
              </>
            ) : (
              <p>המצלמה לא הופעלה עדיין</p>
            )}

            <button onClick={handleFaceRecognition} style={styles.button} disabled={loading}>
              התחלת זיהוי פנים
            </button>
          </>
        ) : null}

        {message && <p style={styles.message}>{message}</p>}

        <button onClick={goBack} style={{ ...styles.button, ...styles.backButton }}>
          חזרה
        </button>
      </div>
    </div>
  );
}

export default UserPanel;
