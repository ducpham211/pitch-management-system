import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaUserCircle, FaCheck, FaCheckDouble } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Chat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/dang-nhap');
      return;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId);
    } catch (e) {
      console.error(e);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/conversations`, config);
        const convs = res.data.content || res.data || [];
        setConversations(convs);
        if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, [API_URL, activeConv]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConv) return;
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/conversations/${activeConv}/messages`, config);
        setMessages(res.data.content || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeConv, API_URL]);

  useEffect(() => {
    if (!activeConv) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      const topic = `/topic/conversations/${activeConv}`;
      client.subscribe(topic, (message) => {
        const newMsg = JSON.parse(message.body);
        
        if (newMsg.type === 'TYPING' && newMsg.senderId !== currentUserId) {
           setIsPartnerTyping(true);
           if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
           typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 2000);
           return;
        }

        if (!newMsg.type || newMsg.type === 'MESSAGE') {
            setIsPartnerTyping(false);
            setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
            });

            // Update sidebar last message visually
            setConversations(prevConvs => prevConvs.map(c => 
                c.id === activeConv ? { ...c, lastMessage: newMsg.content || newMsg.text, updatedAt: new Date() } : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) client.deactivate();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeConv, SOCKET_URL, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (stompClientRef.current?.active && activeConv) {
        stompClientRef.current.publish({
            destination: `/app/chat/${activeConv}/typing`,
            body: JSON.stringify({ type: 'TYPING', senderId: currentUserId })
        });
        // Fallback for simple broadcast if backend doesn't have /app mapping handled specifically
        stompClientRef.current.publish({
            destination: `/topic/conversations/${activeConv}`,
            body: JSON.stringify({ type: 'TYPING', senderId: currentUserId })
        });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { content: messageText };
      
      await axios.post(`${API_URL}/conversations/${activeConv}/messages`, payload, config);
      setMessageText('');
      
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn lúc này.');
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
        const date = new Date(timeStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return timeStr;
    }
  };

  const getPartnerName = (conv: any) => {
    if (conv.partnerName) return conv.partnerName;
    return 'Đối tác giao hữu';
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[85vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-full overflow-hidden">
        
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-800">Tin nhắn</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào.</div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConv(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeConv === conv.id ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {getPartnerName(conv).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-800 truncate">{getPartnerName(conv)}</h3>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Chưa có tin nhắn'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {getPartnerName(conversations.find(c => c.id === activeConv) || {})}
                    </h3>
                    <p className="text-xs text-green-600">Đang hoạt động</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">Hãy bắt đầu cuộc trò chuyện!</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === currentUserId;
                    const isLastMsg = idx === messages.length - 1;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMine ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                          <p>{msg.content || msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-green-100' : 'text-gray-400'}`}>
                            <span className="text-[10px]">{formatTime(msg.createdAt || msg.timestamp)}</span>
                            {isMine && (
                                <span className="text-[10px]" title={isLastMsg ? "Đã nhận" : "Đã xem"}>
                                    {isLastMsg ? <FaCheck /> : <FaCheckDouble className="text-blue-200" />}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isPartnerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center gap-1">
                      <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-green-500 transition"
                  value={messageText}
                  onChange={handleTyping}
                />
                <button 
                  type="submit"
                  className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition shadow-md"
                  disabled={!messageText.trim()}
                >
                  <FaPaperPlane className="ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;