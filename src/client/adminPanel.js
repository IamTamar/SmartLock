import React, { useRef, useState, useEffect } from "react";
import "./userPanel.css";
import AdminDashboard from "./adminDashboard";
import VideoStream from "./VideoStream"; 

function UserPanel({ goBack }) {
    const [faceVerified, setFaceVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showAdmin, setShowAdmin] = useState(false);
    const videoStreamRef = useRef(null); // ה-ref לרכיב VideoStream

    // פונקציה לשליחת נתונים ל-ESP (כפי שהוגדרה בתשובה הקודמת)
    const sendToESP = async (isRecognized, isAdmin) => {
        const isRecognizedValue = isRecognized ? 1 : 0;
        const isAdminValue = isAdmin ? 1 : 0;
        const espUrl = `http://192.168.1.100/access?is_recognized=${isRecognizedValue}&is_admin=${isAdminValue}`;

        try {
            const httpReq = await fetch(espUrl);
            const res = await httpReq.text();
            console.log("תגובה מה-ESP:", res);
            return true;
        } catch (error) {
            console.error("בעיה בבקשת HTTP ל-ESP:", error);
            return false;
        }
    };

    const captureAndSendImage = async () => {
        setLoading(true);
        setMessage("מזהה פנים...");

        // בדיקה שה-ref זמין ושהפונקציה captureFrame קיימת עליו
        if (!videoStreamRef.current || !videoStreamRef.current.captureFrame) {
            setMessage("שגיאה: זרם הוידאו אינו מוכן ללכידה.");
            setLoading(false);
            console.error("VideoStream component or captureFrame function not ready.");
            return;
        }

        let blob = null; // הצהרה על המשתנה blob כאן
        try {
            // קוראים לפונקציה captureFrame מתוך רכיב VideoStream דרך ה-ref
            blob = await videoStreamRef.current.captureFrame();

            if (!blob) {
                setMessage("שגיאה: לא נלכדה תמונה מהזרם.");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("image", blob, "capture.jpg");

            const response = await fetch("http://localhost:5000/detect-face", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            console.log("תוצאה מהשרת:", result);

            if (result.is_recognized && result.is_admin) {
                setFaceVerified(true);
                setMessage(`פנים זוהו בהצלחה! מחובר כמנהל...`);
            
                const espSendSuccess = await sendToESP(true, true);
            
                if (espSendSuccess) {
                    setMessage("זיהוי הצליח ✔ המערכת נפתחת...");
                    setShowAdmin(true);
                } else {
                    setMessage("זוהה כמנהל, אך אירעה שגיאה בתקשורת עם המנעול.");
                }
            } else {
                setFaceVerified(false);
                setMessage("אזהרה חמורה: ניסיון פריצה למערכת");
                await sendToESP(false, false);
            }
        } catch (error) { // שגיאות מלכידת התמונה או משליחה לשרת הפנים
            console.error("שגיאה בתהליך זיהוי הפנים או לכידת תמונה:", error);
            setMessage(`שגיאה: ${error.message || "שליחת תמונה לשרת"}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("UserPanel component mounted. Setting up auto-capture timer.");
        const delayInSeconds = 5;
        setMessage(`התמונה תילכד אוטומטית בעוד ${delayInSeconds} שניות...`);

        const timer = setTimeout(() => {
            console.log(`Time elapsed. Capturing image from stream.`);
            captureAndSendImage();
        }, delayInSeconds * 1000);

        return () => {
            clearTimeout(timer);
            console.log("Auto-capture timer cleared.");
        };
    }, []);

    return showAdmin ? (
        <AdminDashboard goBack={goBack} />
    ) : (
        <div className="container">
            <div className="card">
                <h2 className="title">כניסת מנהל</h2>
                {/* העברת ה-ref לרכיב VideoStream */}
                <VideoStream ref={videoStreamRef} />
                {!faceVerified && (
                    <>
                        {loading && <p>{message}</p>}
                    </>
                )}
                {message && !loading && (
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