import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatWindow({ currentUser, selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', selectedChat.chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesList);
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(text) {
    if (!selectedChat || !text.trim()) return;

    const messageData = {
      chatId: selectedChat.chatId,
      text: text.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'messages'), messageData);

    const chatRef = doc(db, 'chats', selectedChat.chatId);
    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageTime: new Date().toISOString()
    });
  }

  if (!selectedChat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Welcome to Chat</h3>
          <p>Select a user from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="avatar">
            {selectedChat.otherUser.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{selectedChat.otherUser.displayName}</h3>
            <span className="status">{selectedChat.otherUser.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {loading ? (
          <div className="loading-state">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <MessageList messages={messages} currentUser={currentUser} />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;
