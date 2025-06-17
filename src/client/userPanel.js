import React, { useRef, useState } from "react";
import "./userPanel.css";

function UserPanel({ goBack }) {
  const [faceVerified, setFaceVerified] = useState(false);
  const [showEspStream, setShowEspStream] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const imgRef = useRef(null);

  const handleFaceRecognition = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/start-camera", { method: "POST" });
      setShowEspStream(true);
      setTimeout(captureAndSendImage, 10000);
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

  return (
    <div className="user-panel-container">
      <div className="user-panel-card">
        <h2 className="user-panel-title">כניסת משתמש</h2>

        {!faceVerified ? (
          <>
            {showEspStream ? (
              <>
                <img
                  ref={imgRef}
                  id="espStream"
                  className="user-panel-image"
                  src="http://192.168.1.1"
                  alt="ESP Camera"
                  width="250"
                  height="200"
                />
                {loading && <p>מזהה פנים...</p>}
              </>
            ) : (
              <p>המצלמה לא הופעלה עדיין</p>
            )}

            <button
              onClick={handleFaceRecognition}
              className="user-panel-button"
              disabled={loading}
            >
              התחלת זיהוי פנים
            </button>
          </>
        ) : null}

        {message && (
          <p
            className={`user-panel-message ${
              faceVerified ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={goBack}
          className="user-panel-button user-panel-back-button"
        >
          חזרה
        </button>
      </div>
    </div>
  );
}

export default UserPanel;
