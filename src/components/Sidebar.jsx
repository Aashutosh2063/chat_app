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
      const allUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('All users in Firestore:', allUsers);
      console.log('Current user UID:', currentUser.uid);
      const usersList = allUsers
        .filter(user => user.id !== currentUser.uid);
      console.log('Filtered users:', usersList);
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error('Firestore query error:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser.uid]);

  async function handleSelectUser(selectedUser) {
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    
    const chatRef = doc(db, 'chats', chatId);
    try {
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        throw new Error('not found');
      }
    } catch {
      await setDoc(chatRef, {
        participants: [currentUser.uid, selectedUser.id],
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
    (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log('Search-filtered users:', filteredUsers);

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
