import React, { useRef, useState, useEffect } from "react";
import "./userPanel.css";

function AddUser({ goBack }) {
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [currentImageBlob, setCurrentImageBlob] = useState(null);
  
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
    if (!video) 
    {
        setMessage("שגיאה: המצלמה לא מספקת תמונה תקינה.");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        if (blob) {
            setCurrentImageBlob(blob); 
            setVerified(true); 
            setMessage("תמונה נשמרה בהצלחה!\n כעת הזן שם ולחץ 'הוסף משתמש'.");
        } else {
          setMessage("שגיאה בלכידת תמונה.");
        }
    
    }, "image/jpeg");
};

  const sendNewUser = async ()=>{
    if (!newName.trim()) {
        setMessage("אנא הכנס שם משתמש.");
        return;
      }
      if (!currentImageBlob) {
        setMessage("אנא צלם תמונה לפני הוספת המשתמש.");
        return;
      }
      setMessage("שולח נתונים לשרת...");

    const formData = new FormData();
    formData.append("image", currentImageBlob, "newFace.jpg");
    formData.append("name", newName.trim()); 

    try {
            const response = await fetch("http://localhost:5000/add-face", {
              method: "POST",
              body: formData
            });
            const result = await response.json();
            console.log("תוצאה מהשרת:", result);
            if (response.ok && result.status === "success"){
            setMessage(`✅ פנים עבור ${result.person_name} נוספו בהצלחה!`);
            setNewName(""); 
            setCurrentImageBlob(null); 
            }
            else {
                setMessage(`❌ שגיאה: ${result.message || "אירעה שגיאה בשרת."}`);
            }
        }
    catch(error){
     console.error("שגיאה בשליחת משתמש חדש:", error);
      setMessage("שגיאה בהוספת המשתמש. אנא נסה שוב.");
    }finally {
        setLoading(false);
      }
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">הוספת משתמש</h2>
        <br></br>       
        {!verified && (
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
      שמירת זיהוי פנים
    </button>
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
        <br></br>
        <button onClick={sendNewUser} className="button back">
          הוסף משתמש 
        </button>
        <button onClick={goBack} className="button back">
          חזרה
        </button>
      </div>
    </div>
  );
}

export default AddUser;
