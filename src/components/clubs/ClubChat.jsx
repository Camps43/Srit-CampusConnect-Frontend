import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";
import API from "../../services/api";

export default function ClubChat({ clubId, currentUser, clubDetails }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  const room = `club:${clubId}`;

  const userId =
    currentUser?._id?.toString() ||
    currentUser?.id?.toString();

  // ===============================
  // SAFE ROLE DETECTION (UNCHANGED LOGIC)
  // ===============================
  function getRole(msg) {
    const senderId = msg.from?._id?.toString();

    if (!clubDetails) {
      if (msg.from?.role === "faculty") return "Staff-Incharge";
      if (msg.from?.role === "student") return "Member";
      return "";
    }

    const clubHeadId =
      typeof clubDetails.clubHead === "object"
        ? clubDetails.clubHead?._id?.toString()
        : clubDetails.clubHead?.toString();

    const facultyId =
      typeof clubDetails.faculty === "object"
        ? clubDetails.faculty?._id?.toString()
        : clubDetails.faculty?.toString();

    const memberIds = clubDetails.members?.map(m =>
      typeof m === "object"
        ? m._id?.toString()
        : m?.toString()
    );

    if (senderId === clubHeadId) return "Club Head";
    if (senderId === facultyId) return "Staff-Incharge";
    if (memberIds?.includes(senderId)) return "Member";

    if (msg.from?.role === "faculty") return "Staff-Incharge";
    if (msg.from?.role === "student") return "Member";

    return "";
  }

  // ===============================
  // LOAD MESSAGES
  // ===============================
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await API.get(`/messages/${room}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages");
      }
    }

    loadMessages();
  }, [room]);

  // ===============================
  // SOCKET JOIN
  // ===============================
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-room", room);

    socket.on("message:new", (msg) => {
      if (msg.room === room) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.emit("leave-room", room);
      socket.off("message:new");
    };
  }, [socket, room]);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===============================
  // SEND MESSAGE (UPDATED)
  // ===============================
  function sendMessage() {
    if (!text.trim()) return;

    socket.emit("message", {
      room,
      text,
      meta: replyTo
        ? {
            reply: {
              messageId: replyTo._id,
              text: replyTo.text,
              senderName: replyTo.senderName,
            },
          }
        : {},
    });

    setText("");
    setReplyTo(null);
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-gray-50">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const role = getRole(msg);

          return (
            <div
              key={msg._id}
              className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
              onClick={() =>
                setReplyTo({
                  _id: msg._id,
                  text: msg.text,
                  senderName: msg.from?.name,
                })
              }
            >
              {/* Name + Tag */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {msg.from?.name}
                </span>

                {role && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === "Club Head"
                        ? "bg-purple-100 text-purple-700"
                        : role === "Staff-Incharge"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {role}
                  </span>
                )}
              </div>

              {/* Reply Preview (NEW) */}
              {msg.meta?.reply && (
                <div className="bg-gray-100 border-l-4 border-indigo-500 p-2 mb-2 text-xs rounded">
                  <strong>{msg.meta.reply.senderName}</strong>
                  <div className="truncate">{msg.meta.reply.text}</div>
                </div>
              )}

              {/* Message */}
              <p className="text-sm text-gray-800">
                {msg.text}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Above Input (NEW) */}
      {replyTo && (
        <div className="bg-gray-200 p-2 text-xs flex justify-between items-center border-t">
          <div>
            <strong>Replying to {replyTo.senderName}:</strong>
            <div className="truncate">{replyTo.text}</div>
          </div>
          <button
            className="text-red-500"
            onClick={() => setReplyTo(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
