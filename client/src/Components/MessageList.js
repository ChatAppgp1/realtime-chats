import React from 'react';

const MessageList = ({ messages, user }) => {
  const sortedMessages = [...messages].sort((a, b) => {
    const getTime = (val) => {
      if (!val) return 0;
      if (typeof val.toDate === 'function') return val.toDate().getTime();
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = Date.parse(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    return getTime(a.createdAt) - getTime(b.createdAt);
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    let date;
    try {
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        console.warn('Unknown timestamp format:', timestamp);
        return '';
      }

      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp);
        return '';
      }

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return '';
    }
  };


  return (
    
    
    <div style={{paddingTop: '40px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '20px',paddingLeft:"20px",paddingRight:"20px" }}>
      
      {sortedMessages.map((msg, index) => {
        const isSender = msg.sender === user.uid;
        const style = {
          backgroundColor: isSender ? 'blue' : 'rgba(17, 25, 40, 0.8)',
          padding: '10px 15px',
          borderRadius: isSender ? '10px 0px 10px 10px' : '0px 10px 10px 10px',
          alignSelf: isSender ? 'flex-end' : 'flex-start',
          maxWidth: '70%',
        };

        return (
          <div key={msg.id || index} style={style}>
            <p style={{ margin: 0 }}>
              {msg.text}</p>
            <small style={{ display: 'block', textAlign: 'right', marginTop: '5px', color: '#aaa' }}>
              {formatTime(msg.createdAt)}
            </small>
          </div>
        );
      })}
    </div>
    
  );
};

export default MessageList;
