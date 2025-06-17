import React, { useState, useEffect } from "react";
import AddUser from "./AddUser"; // ודאי שהנתיב נכון
import "./adminDashboard.css";

function AdminDashboard({ goBack }) {
  const [users, setUsers] = useState(["tamar"]);
  const [showAddUser, setShowAddUser] = useState(false); 

  useEffect(() => {
    const usersList = async () => {
      try {
        const response = await fetch("http://localhost:5000/users-list");
        const result = await response.json();
        setUsers(result.users || []);
        console.log("תוצאה מהשרת:", result);
      } catch (error) {
        console.error("שגיאה בהעלאת הרשימה", error);
        setUsers([]);
      }
    };
    usersList();
  }, []);

  const handleBackFromAdd = () => {
    setShowAddUser(false);
  };

  return (
    <>
      {showAddUser ? (
        <AddUser goBack={handleBackFromAdd} />
      ) : (
        <div>
          <h1>רשימת משתמשים</h1>
          {users.length > 0 ?
            ( <ul>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          ) : (
            <p>טוען משתמשים או שאין משתמשים זמינים...</p>
          )}

          <button onClick={() => setShowAddUser(true)} className="button back">
            הוספת משתמש
          </button>
          <button onClick={goBack} className="button back">
            חזרה
          </button>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
