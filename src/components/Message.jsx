function Message({ message, isOwn }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {!isOwn && <span className="sender-name">{message.senderName}</span>}
        <p>{message.text}</p>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

export default Message;
