import React, { useState } from 'react';
import { recognizeFaceFromVideo, addUserDescriptor } from './faceService';

function AdminPanel({ goBack }) {
  const [screen, setScreen] = useState('verify');
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [users, setUsers] = useState([
    { id: 1, username: 'david123' },
    { id: 2, username: 'sara456' },
    { id: 3, username: 'admin1' },
  ]);

  const handleVerify = async () => {
    const label = await recognizeFaceFromVideo();
    if (label === 'tamar' && password === 'admin123') {
      alert('✅ זוהית כמנהל');
      setVerified(true);
      setScreen('home');
    } else {
      alert('❌ זיהוי נכשל או סיסמה שגויה');
    }
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      alert('אנא מלא שם משתמש וסיסמה');
      return;
    }
    const label = await recognizeFaceFromVideo();
    if (!label) {
      alert('לא זוהו פנים. נסה שוב');
      return;
    }
    addUserDescriptor(newUsername, label);
    setUsers([...users, { id: Date.now(), username: newUsername }]);
    alert('המשתמש נוסף בהצלחה');
    setScreen('home');
  };

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const renderScreen = () => {
    if (!verified && screen === 'verify') {
      return (
        <div>
          <h3>כניסת מנהל</h3>
          <p>הכנס סיסמה ולאחר מכן בצע זיהוי פנים</p>
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleVerify}>🔐 אמת זהות</button>
        </div>
      );
    }

    switch (screen) {
      case 'addUser':
        return (
          <div>
            <h3>הוספת משתמש חדש</h3>
            <input
              type="text"
              placeholder="שם משתמש"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="סיסמה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <br />
            <button onClick={handleAddUser}>📷 צלם פנים והוסף</button>
            <br />
            <br />
            <button onClick={() => setScreen('home')}>חזור</button>
          </div>
        );
      case 'manageUsers':
        return (
          <div>
            <h3>רשימת משתמשים</h3>
            {users.length === 0 ? (
              <p>אין משתמשים רשומים.</p>
            ) : (
              <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    {user.username}{' '}
                    <button onClick={() => handleDelete(user.id)}>מחק</button>
                  </li>
                ))}
              </ul>
            )}
            <br />
            <button onClick={() => setScreen('home')}>חזור</button>
          </div>
        );
      default:
        return (
          <div>
            <h2>פאנל ניהול</h2>
            <p>זוהית בהצלחה כמנהל.</p>
            <button onClick={() => setScreen('addUser')}>➕ הוסף משתמש חדש</button>
            <br />
            <br />
            <button onClick={() => setScreen('manageUsers')}>🧑‍💼 נהל משתמשים</button>
            <br />
            <br />
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      {renderScreen()}
      <hr />
      <button onClick={goBack}>⬅ חזור למסך הראשי</button>
    </div>
  );
}

export default AdminPanel;
