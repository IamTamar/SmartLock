import React, { useRef, useState, useEffect } from "react";
import "./userPanel.css";
import AdminDashboard from "./adminDashboard";

function UserPanel({ goBack }) {
  const [faceVerified, setFaceVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    // הפעלת מצלמת מחשב
    const videoElement = videoRef.current;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
        videoElement.play();}
      } catch (error) {
        console.error("שגיאה בגישה למצלמה:", error);
        setMessage("לא ניתן לגשת למצלמה.");
      }
    };
    startWebcam();

    // ניקוי המשאבים ביציאה
    return () => {
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFaceRecognition = () => {
    setLoading(true);
    setTimeout(captureAndSendImage, 2000); // זמן להתייצבות המצלמה
  };

  const captureAndSendImage = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const response = await fetch("http://localhost:5000/detect-face", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("תוצאה מהשרת:", result);

        if (result.is_recognized && result.is_admin) {
          setFaceVerified(true);
          setMessage(`ברוכים הבאים, מנהל!`);
          setShowAdmin(true);

        } else {
          setFaceVerified(false);
          setMessage("אזהרה חמורה: ניסיון פריצה למערכת");
        }
      } catch (error) {
        console.error("שגיאה בשליחת תמונה:", error);
        setMessage("שגיאה בשליחת תמונה לשרת.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  return showAdmin ? (
    <AdminDashboard goBack={goBack} />
   ) : (
    <div className="container">
      <div className="card">
        <h2 className="title">כניסת מנהל</h2>

        {!faceVerified && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              width="250"
              height="200"
              className="video"
            />
            {loading && <p>מזהה פנים...</p>}
            <button onClick={handleFaceRecognition} className="button" disabled={loading}>
              התחלת זיהוי פנים
            </button>
          </>
        )}

        {message && (
          <p className={`message ${faceVerified ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <button onClick={goBack} className="button back">
          חזרה
        </button>
      </div>
    </div>
  );
}

export default UserPanel;
