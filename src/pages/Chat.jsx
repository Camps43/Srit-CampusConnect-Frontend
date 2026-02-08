import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'
import API from '../services/api'
import Card from '../components/ui/Card'

export default function Chat(){
  const { socket } = useSocket() || {}
  const [room, setRoom] = useState('room:global')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(()=> {
    if (!socket) return
    socket.emit('join-room', room)
    socket.on('message:new', (m) => setMessages(prev => [...prev, m]))
    return ()=> { socket.off('message:new'); socket.emit('leave-room', room) }
  }, [socket, room])

  useEffect(()=> { API.get(`/messages/${room}`).then(r=>setMessages(r.data)).catch(()=>{}) },[room])

  const send = () => {
    if (!text.trim() || !socket) return
    socket.emit('message', { room, text })
    setText('')
  }

  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages])

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Chat — {room}</h3>
        <select value={room} onChange={e=>setRoom(e.target.value)} className="px-2 py-1 border rounded">
          <option value="room:global">Global</option>
          <option value="room:club:general">Club General</option>
        </select>
      </div>

      <div className="flex flex-col h-96">
        <div className="overflow-auto flex-1 space-y-2 mb-3">
          {messages.map((m, i) => (
            <div key={i} className="p-2 rounded-md bg-gray-100 w-fit">
              <div className="text-xs text-gray-500">{m.from?.name || 'Anon'}</div>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a message..." />
          <button onClick={send} className="bg-primary text-white px-4 py-2 rounded">Send</button>
        </div>
      </div>
    </Card>
  )
}
