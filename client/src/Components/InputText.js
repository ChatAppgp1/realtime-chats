import React, { useState, useRef, useEffect } from 'react';
import emoji from '../Components/images/emoji.png';
import EmojiPicker from 'emoji-picker-react'

const InputText = ({ addMessage }) => {
  const [message, setMessage] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const emojiRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      addMessage({ message: message.trim() });
      setMessage('');
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setPickerVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setPickerVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <input
          type="text"
          placeholder='Type a message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(17, 25, 40, 0.4)',
            border: 'none',
            outline: 'none',
            color: 'white',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '16px'
          }}
        />
        <div ref={emojiRef} style={{ position: 'relative' }}>
          <img
            src={emoji}
            alt="Emoji"
            onClick={() => setPickerVisible(!isPickerVisible)}
            style={{ width: 30, height: 30, cursor: 'pointer' }}
          />
          {isPickerVisible && (
            <div style={{ position: 'absolute', bottom: '100%', right: 0 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button
          type='submit'
          style={{
            backgroundColor: '#5183fe',
            color: 'white',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </>
  );
};

export default InputText;