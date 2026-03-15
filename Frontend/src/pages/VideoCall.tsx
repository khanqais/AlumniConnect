import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Users, MessageCircle, X, Send } from 'lucide-react';
import { useLocation } from "react-router-dom";

interface Message {
    sender: string;
    text: string;
}

export default function VideoCall() {
    const location = useLocation();
const { startTime } = location.state || {};

    const { user } = useAuth();
    const { roomId } = useParams<{ roomId: string }>();
    useEffect(() => {
  if (!roomId) return;

  const markJoin = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/webinars/attendance/join/${roomId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("✅ Attendance marked (JOIN)");
    } catch (err) {
      console.error("❌ Attendance join failed", err);
    }
  };

  markJoin();
}, [roomId]);

    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [callStarted, setCallStarted] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<Message[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showInCallChat, setShowInCallChat] = useState(false);
    const [copied, setCopied] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

    useEffect(() => {
    if (!startTime) return;

    const now = new Date();
    const start = new Date(startTime);

    if (now < start) {
        setConnectionStatus("Call has not started yet");
        return;
    }
}, [startTime]);


    useEffect(() => {
        if (!roomId) return;

        const token = localStorage.getItem('token');

        socketRef.current = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected');
            setConnectionStatus('Waiting for others to join...');
        });
        socketRef.current.on('connect_error', (err) => {
            console.error('❌ Socket error:', err.message);
            setConnectionStatus('Connection error. Please refresh.');
        });

        pcRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach((track) => pcRef.current?.addTrack(track, stream));
            })
            .catch((err) => {
                console.error('Error accessing media devices:', err);
                alert('Unable to access camera/microphone. Please grant permissions.');
            });

        pcRef.current.ontrack = (event) => {
            console.log('🎥 Received remote track');
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setCallStarted(true);
                setConnectionStatus('Connected');
            }
        };

        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        socketRef.current.emit('join-room', roomId);

        socketRef.current.on('initiator', () => {
            console.log('🟢 I am initiator');
            setConnectionStatus('Waiting for others to join...');
        });

        socketRef.current.on('peer-in-room', () => {
            console.log('👥 Peer already in room');
            setConnectionStatus('Connecting to peer...');
        });

        socketRef.current.on('ready', async () => {
            console.log('📞 Peer ready - creating offer');
            setConnectionStatus('Establishing connection...');

            if (!pcRef.current) return;

            try {
                const offer = await pcRef.current.createOffer();
                await pcRef.current.setLocalDescription(offer);

                socketRef.current?.emit('offer', { roomId, offer });
                console.log('📤 Sent offer');
            } catch (err) {
                console.error('Error creating offer:', err);
                setConnectionStatus('Connection failed');
            }
        });

        socketRef.current.on('offer', async ({ offer }) => {
            console.log('📥 Received offer');
            setConnectionStatus('Answering call...');

            try {
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pcRef.current?.createAnswer();
                await pcRef.current?.setLocalDescription(answer);

                socketRef.current?.emit('answer', { roomId, answer });
                console.log('📤 Sent answer');
            } catch (err) {
                console.error('Error handling offer:', err);
                setConnectionStatus('Connection failed');
            }
        });

        socketRef.current.on('answer', async ({ answer }) => {
            console.log('📥 Received answer');
            try {
                await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('✅ Connection established');
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        });

        socketRef.current.on('ice-candidate', async ({ candidate }) => {
            try {
                await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        });

        socketRef.current.on('user-left', ({ name }) => {
            console.log(`👋 ${name} left the call`);
            setConnectionStatus(`${name} left the call`);
            setCallStarted(false);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        });

        socketRef.current.on('chat-message', (data) => setChat((prev) => [...prev, data]));

        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            pcRef.current?.close();
            socketRef.current?.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat, showInCallChat]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const msg = {
            sender: user?.name || 'Unknown',
            text: message,
        };

        socketRef.current?.emit('chat-message', {
            roomId,
            message: msg,
        });

        setChat((prev) => [...prev, msg]);
        setMessage('');
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const endCall = () => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        pcRef.current?.close();
        socketRef.current?.disconnect();
        navigate('/dashboard');
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
//     useEffect(() => {
//   return () => {
//     if (!roomId) return;

//     fetch(
//       `http://localhost:5000/api/webinars/attendance/leave/${roomId}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     ).then(() => {
//       console.log("👋 Attendance marked (LEAVE)");
//     });
//   };
// }, [roomId]);


    return (
        <div className="min-h-screen bg-[#0A0D14] text-gray-200 relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.08),transparent_35%)]"></div>
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Video Call</h1>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Room ID: {roomId}</p>
                            <button
                                onClick={copyRoomId}
                                className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                                <Copy className="h-3 w-3" />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${callStarted ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <p className="text-sm font-medium text-gray-700">{connectionStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Video Call Layout */}
                <div>
                    {/* Video Section */}
                    <div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            {/* Remote Video (Large) */}
                            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gray-900">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="h-full w-full object-cover"
                                />
                                {!callStarted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                                        <div className="text-center">
                                            <Users className="mx-auto h-16 w-16 text-gray-400" />
                                            <p className="mt-4 text-lg font-medium">{connectionStatus}</p>
                                            <p className="mt-2 text-sm text-gray-400">Share the room ID to invite participants</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Local Video (Small) */}
                            <div className="relative">
                                <div className="aspect-video overflow-hidden rounded-xl bg-gray-900">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="h-full w-full object-cover"
                                    />
                                    {isVideoOff && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                                                <span className="text-2xl font-bold text-white">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-700">You ({user?.name})</p>
                            </div>

                            {/* Controls */}
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <button
                                    onClick={toggleMute}
                                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                                        isMuted
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>

                                <button
                                    onClick={toggleVideo}
                                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                                        isVideoOff
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                                >
                                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                                </button>

                                <button
                                    onClick={endCall}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600"
                                    title="End call"
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => setShowInCallChat(true)}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white transition-all hover:bg-indigo-600"
                                    title="Open in-call chat"
                                >
                                    <Send className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => setShowChat(true)}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-all hover:bg-blue-600"
                                    title="Open full chat"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showChat && (
                    <div className="fixed inset-0 z-50 bg-black/60 p-4 sm:p-6">
                        <div className="mx-auto flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0E121B] shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-200">Chat</h2>
                                <button
                                    onClick={() => setShowChat(false)}
                                    className="rounded-md p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                    title="Close chat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <iframe
                                src="http://localhost:5173/chat"
                                title="Chat"
                                className="h-full w-full border-0"
                            />
                        </div>
                    </div>
                )}

                {showInCallChat && (
                    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:p-6">
                        <div className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                                <h2 className="text-lg font-semibold text-gray-900">In-call Chat</h2>
                                <button
                                    onClick={() => setShowInCallChat(false)}
                                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    title="Close in-call chat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {chat.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        <p className="text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    chat.map((m, i) => {
                                        const isOwn = m.sender === user?.name;
                                        return (
                                            <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'}`}>
                                                    <p className="mb-1 text-xs font-medium text-gray-600">{m.sender}</p>
                                                    <div
                                                        className={`rounded-2xl px-4 py-2 ${
                                                            isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <p className="break-words text-sm">{m.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="border-t border-gray-200 p-4">
                                <form onSubmit={sendMessage} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}