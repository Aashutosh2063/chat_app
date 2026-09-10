import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const { currentUser } = useAuth();

  return (
    <div className="chat-layout">
      <Sidebar 
        currentUser={currentUser} 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat} 
      />
      <ChatWindow 
        currentUser={currentUser} 
        selectedChat={selectedChat} 
      />
    </div>
  );
}

export default Chat;
