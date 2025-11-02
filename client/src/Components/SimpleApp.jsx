import { useState, useEffect } from 'react';
import SimpleLogin from './SimpleLogin';

function SimpleApp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/check_session").then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          if (data.authenticated) {
            setUser(data.user);
          }
        });
      }
    });
  }, []);

  function handleLogout() {
    fetch("/api/auth/logout", {
      method: "DELETE",
    }).then(() => setUser(null));
  }

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.full_name}!</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  } else {
    return <SimpleLogin onLogin={(data) => setUser(data.user)} />;
  }
}

export default SimpleApp;