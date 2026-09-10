import Message from './Message';

function MessageList({ messages, currentUser }) {
  return (
    <div className="message-list">
      {messages.map(message => (
        <Message 
          key={message.id} 
          message={message} 
          isOwn={message.senderId === currentUser.uid}
        />
      ))}
    </div>
  );
}

export default MessageList;
