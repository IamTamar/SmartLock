import React, { useRef, useState, useEffect } from "react";
import "./userPanel.css";
import VideoStream from "./VideoStream"; 

function AddUser({ goBack }) {
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const videoStreamRef = useRef(null); // ה-ref לרכיב VideoStream

  useEffect(() => {
    if (!newName.trim()) return; // אם השם ריק – אל תעשה כלום
  
    const delayInSeconds = 3;
    setMessage(`התמונה תילכד ותישלח עבור ${newName} בעוד ${delayInSeconds} שניות...`);
  
    const timer = setTimeout(() => {
      captureAndSendImage();
    }, delayInSeconds * 1000);
  
    return () => clearTimeout(timer); // ביטול טיימר אם המשתמש שינה שם מהר
  }, [newName]);

  const captureAndSendImage = async () => {
    setLoading(true);
    let blob = null; // הצהרה על המשתנה blob כאן
  
    try {
      // קוראים לפונקציה captureFrame מתוך רכיב VideoStream דרך ה-ref
      blob = await videoStreamRef.current.captureFrame();
  
      if (!blob) {
        setMessage("שגיאה: לא נלכדה תמונה מהזרם.");
        setLoading(false);
        return;
      }
  
      if (!newName.trim()) {
        setMessage("אנא הכנס שם משתמש.");
        setLoading(false);
        return;
      }
  
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");
      formData.append("name", newName.trim());
  
      try {
        const response = await fetch("http://localhost:5000/add-face", {
          method: "POST",
          body: formData
        });
  
        const result = await response.json();
        console.log("תוצאה מהשרת:", result);
  
        if (response.ok && result.status === "success") {
          setMessage(`פנים עבור ${result.person_name} נוספו בהצלחה!`);
          setNewName("");
          setVerified(true);
        } else {
          setMessage(`שגיאה: ${result.message || "אירעה שגיאה בשרת."}`);
        }
  
      } catch (error) {
        console.error("שגיאה בשליחת משתמש חדש:", error);
        setMessage("שגיאה בהוספת המשתמש. אנא נסה שוב.");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("שגיאה בלכידת תמונה:", error);
      setMessage("שגיאה בלכידת התמונה.");
      setLoading(false);
    }
  };
  


  return (
    <div className="container">
      <div className="card">
        <h2 className="title">הוספת משתמש</h2>
        <VideoStream ref={videoStreamRef} />
        {!verified && (
        <>
        {loading && <p>מזהה פנים...</p>}
        </>
        )}
        {message && (
          <p className={`message ${verified ? "success" : "error"}`}>
            {message}
          </p>
        )}
        <input
            type="text"
            placeholder="הקש שם משתמש"
            style={{ width: '100px', height: '40px' }}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
        /> 
        <button onClick={goBack} className="button back">
          חזרה
        </button>
      </div>
    </div>
  );
}

export default AddUser;
