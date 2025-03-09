import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  // State for authentication (login/signup)
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // holds logged in user's data

  // State for transaction and rewards
  const [moneySpent, setMoneySpent] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [notification, setNotification] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  // Handle Signup
  const handleSignup = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/signup', {
        user_id: userId,
        password: password,
      });
      alert("Signup successful! Please login.");
      setAuthMode("login");
    } catch (error) {
      alert("Signup error: " + error.response.data.error);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        user_id: userId,
        password: password,
      });
      const loggedUser = response.data.user;
      setUser(loggedUser);
      setTransactions(loggedUser.transactions);
      setTotalPoints(loggedUser.total_points);
      setNotification('');
    } catch (error) {
      alert("Login error: " + error.response.data.error);
    }
  };

  // Handle Signout
  const handleSignout = () => {
    setUser(null);
    setUserId('');
    setPassword('');
    setTransactions([]);
    setTotalPoints(0);
    setNotification('');
  };

  // Handle recording a transaction and updating rewards
  const handleTransaction = async () => {
    if (!moneySpent) {
      alert('Please enter the money spent');
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/transaction', {
        user_id: user.user_id,
        amount: parseFloat(moneySpent),
      });
      const data = response.data;
      // Update transaction history and total rewards
      setTransactions(prev => [...prev, data]);
      setTotalPoints(data.total_points);
      setMoneySpent('');
      // Automatically trigger a notification
      const features = parseFloat(moneySpent) > 50 ? [6, 7] : [1, 2];
      const notifResponse = await axios.post('http://127.0.0.1:5002/notify', {
        features: features,
      });
      setNotification(notifResponse.data.notification);
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  // Handle redeeming rewards
  const handleRedeem = async () => {
    if (!redeemAmount) {
      alert('Please enter an amount of rewards to redeem');
      return;
    }
    const redeemValue = parseFloat(redeemAmount);
    if (redeemValue > totalPoints) {
      alert('Not enough rewards to redeem');
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/redeem', {
        user_id: user.user_id,
        redeem_amount: redeemValue,
      });
      const redeemTxn = response.data;
      setTransactions(prev => [...prev, redeemTxn]);
      setTotalPoints(redeemTxn.total_points);
      setRedeemAmount('');
    } catch (error) {
      console.error('Redeem Error:', error);
    }
  };
  
  // If user is not logged in, display Login/Signup forms
  if (!user) {
    return (
      <div style={{ margin: '20px' }}>
        <h1>{authMode === "login" ? "Login" : "Signup"}</h1>
        <div>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', marginBottom: '10px' }}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', marginBottom: '10px' }}
          /><br />
          {authMode === "login" ? (
            <>
              <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Login
              </button>
              <p>
                Don't have an account?{" "}
                <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setAuthMode("signup")}>
                  Signup here
                </span>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleSignup} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Signup
              </button>
              <p>
                Already have an account?{" "}
                <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setAuthMode("login")}>
                  Login here
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Dashboard for logged in user
  return (
    <div style={{ margin: '20px' }}>
      <h1>Rewards Dashboard</h1>
      <h2>Welcome, {user.user_id}</h2>
      <button onClick={handleSignout} style={{ padding: '8px 16px', fontSize: '14px' }}>
        Sign Out
      </button>

      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <input
          type="number"
          placeholder="Money Spent"
          value={moneySpent}
          onChange={(e) => setMoneySpent(e.target.value)}
          style={{ fontSize: '24px', padding: '10px', width: '200px' }}
        />
        <button
          onClick={handleTransaction}
          style={{
            fontSize: '24px',
            padding: '10px 20px',
            marginLeft: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Spend & Earn Rewards
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Total Rewards: {totalPoints}</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Redeem Rewards</h3>
        <input
          type="number"
          placeholder="Enter rewards to redeem"
          value={redeemAmount}
          onChange={(e) => setRedeemAmount(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button onClick={handleRedeem} style={{ padding: '10px 20px', marginLeft: '10px', fontSize: '16px' }}>
          Redeem Rewards
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Transaction History</h3>
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Money Spent</th>
              <th>Rewards Earned / Deducted</th>
              <th>Total Rewards</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index}>
                <td>{txn.type ? txn.type : 'transaction'}</td>
                <td>{txn.type === 'transaction' ? txn.amount : '-'}</td>
                <td>
                  {txn.type === 'transaction'
                    ? txn.points_awarded
                    : txn.type === 'redeem'
                    ? `-${txn.points_deducted}`
                    : '-'}
                </td>
                <td>{txn.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notification && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Notification:</h3>
          <p>{notification}</p>
        </div>
      )}
    </div>
  );
};

export default App;
