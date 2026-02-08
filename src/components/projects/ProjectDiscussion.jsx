import { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectDiscussion({ projectId }) {
  const socket = useSocket();
  const { profile } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const room = `project:${projectId}`;

  // ==============================
  // LOAD OLD MESSAGES
  // ==============================
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await API.get(`/messages/${room}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    }
    loadMessages();
  }, [projectId]);

  // ==============================
  // SOCKET EVENTS
  // ==============================
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', room);

    const onNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('message:new', onNewMessage);

    return () => {
      socket.emit('leave-room', room);
      socket.off('message:new', onNewMessage);
    };
  }, [socket, room]);

  // ==============================
  // SEND TEXT
  // ==============================
  function sendText() {
    if (!text.trim() || !socket) return;

    socket.emit('message', {
      room,
      text,
      meta: { type: 'text' },
    });

    setText('');
  }

  // ==============================
  // UPLOAD IMAGE / VIDEO
  // ==============================
  async function uploadMedia(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await API.post(
      '/projects/discussion/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    socket.emit('message', {
      room,
      text: res.data.url,
      meta: {
        type: file.type.startsWith('video') ? 'video' : 'image',
      },
    });
  }

  return (
    <div className="space-y-3">

      {/* CHAT AREA */}
      <div className="h-72 overflow-y-auto border rounded p-3 bg-gray-50">
        {messages.map(m => (
          <div
            key={m._id}
            className={`mb-3 p-2 rounded max-w-[70%] ${
              m.from?._id === profile?._id
                ? 'bg-indigo-100 ml-auto'
                : 'bg-white'
            }`}
          >
            <div className="text-xs text-gray-600 mb-1">
              <strong>{m.from?.name || 'Unknown'}</strong>
              <span className="ml-2 px-2 py-0.5 rounded bg-gray-200">
                {m.from?.role || 'member'}
              </span>
            </div>

            {m.meta?.type === 'text' && <p>{m.text}</p>}

            {m.meta?.type === 'image' && (
              <img src={m.text} className="w-40 rounded mt-1" />
            )}

            {m.meta?.type === 'video' && (
              <video controls className="w-40 rounded mt-1">
                <source src={m.text} />
              </video>
            )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message"
        className="border p-2 w-full rounded"
      />

      <div className="flex gap-2">
        <button
          onClick={sendText}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={uploadMedia}
        />
      </div>
    </div>
  );
}
