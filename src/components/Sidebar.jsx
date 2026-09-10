import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import UserList from './UserList';

function Sidebar({ currentUser, selectedChat, onSelectChat }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(usersList);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser.uid]);

  async function handleSelectUser(selectedUser) {
    const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');
    
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.uid, selectedUser.uid],
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageTime: new Date().toISOString()
      });
    }
    
    onSelectChat({
      chatId,
      otherUser: selectedUser
    });
  }

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="avatar">{currentUser.displayName?.charAt(0).toUpperCase()}</div>
          <span className="username">{currentUser.displayName}</span>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="user-list">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? 'No users found' : 'No other users yet'}
          </div>
        ) : (
          <UserList 
            users={filteredUsers} 
            onSelectUser={handleSelectUser}
            selectedChat={selectedChat}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}

export default Sidebar;
