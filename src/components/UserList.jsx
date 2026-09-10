function UserList({ users, onSelectUser, selectedChat, currentUser }) {
  return (
    <div className="users-container">
      {users.map(user => (
        <div
          key={user.id}
          className={`user-item ${selectedChat?.otherUser?.id === user.id ? 'selected' : ''}`}
          onClick={() => onSelectUser(user)}
        >
          <div className="user-avatar">
            {user.displayName?.charAt(0).toUpperCase()}
            {user.online && <span className="online-indicator"></span>}
          </div>
          <div className="user-details">
            <span className="user-name">{user.displayName}</span>
            <span className="user-status">{user.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserList;
