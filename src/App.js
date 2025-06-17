import React, { useState } from "react";
import AdminPanel from "./client/adminNisui";
import UserPanel from "./client/nisui";

function App() {
  const [screen, setScreen] = useState("home");

  return (
    <div style={styles.container}>
      {screen === "home" && (
        <div style={styles.card}>
          <h1 style={styles.title}>אפליקציית מנעול חכם</h1>
          <button style={styles.button} onClick={() => setScreen("admin")}>
            כניסת מנהל
          </button>
          <button style={styles.button} onClick={() => setScreen("user")}>
            כניסת משתמש
          </button>
        </div>
      )}
      {screen === "admin" && <AdminPanel goBack={() => setScreen("home")} />}
      {screen === "user" && <UserPanel goBack={() => setScreen("home")} />}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #d3cce3, #e9e4f0)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
  },
  title: {
    marginBottom: "30px",
    fontSize: "28px",
    color: "#333",
  },
  button: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "12px 24px",
    margin: "10px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default App;
