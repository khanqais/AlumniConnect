import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from '../context/AuthContext';

interface Message {
  sender: string;
  text: string;
}



export default function VideoCall() {
    const { user } = useAuth();
  const { roomId } = useParams<{ roomId: string }>();
  console.log(roomId);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [isInitiator, setIsInitiator] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return; // safety check

    const token = localStorage.getItem("token");

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => console.log("✅ Socket connected"));
    socketRef.current.on("connect_error", (err) =>
      console.error("❌ Socket error:", err.message)
    );

    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) =>
          pcRef.current?.addTrack(track, stream)
        );
      });

    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          room: roomId,
          candidate: event.candidate,
        });
      }
    };

    socketRef.current.emit("join-room", roomId);

    socketRef.current.on("user-connected", () => setIsInitiator(true));

    socketRef.current.on("offer", async ({ offer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current?.createAnswer();
      await pcRef.current?.setLocalDescription(answer);

      socketRef.current?.emit("answer", { room: roomId, answer });
    });

    socketRef.current.on("answer", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      await pcRef.current?.addIceCandidate(candidate);
    });

    socketRef.current.on("chat-message", (data) => setChat((prev) => [...prev, data]));

    return () => {
      pcRef.current?.close();
      socketRef.current?.disconnect();
      setCallStarted(false);
    };
  }, [roomId]);

  const startCall = async () => {
    if (!pcRef.current) return;

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socketRef.current?.emit("offer", { room: roomId, offer });
    setCallStarted(true);
  };

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msg = { sender: "Me", text: message };
//     socketRef.current?.emit("chat-message", { room: roomId, message: msg });
//     setChat((prev) => [...prev, msg]);
//     setMessage("");
//   };
const sendMessage = () => {
  if (!message.trim()) return;

  const msg = {
    sender: user?.role || "Unknown", // or user?.name
    text: message,
  };

  socketRef.current?.emit("chat-message", {
    room: roomId,
    message: msg,
  });

  setChat((prev) => [...prev, msg]);
  setMessage("");
};


  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* VIDEO */}
      <div>
        <video ref={localVideoRef} autoPlay muted playsInline width={300} />
        <video ref={remoteVideoRef} autoPlay playsInline width={300} />
        {isInitiator && !callStarted && <button onClick={startCall}>Start Call</button>}
      </div>

      {/* CHAT */}
      <div style={{ width: 300 }}>
        <h3>Chat</h3>
        <div style={{ height: 200, border: "1px solid gray", overflowY: "auto", padding: 5 }}>
          {chat.map((m, i) => (
            <div key={i}>
              <b>{m.sender}:</b> {m.text}
            </div>
          ))}
        </div>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message" />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
