import { useState } from 'react';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../../mocks/chatData';

const Chat = () => {
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0].id);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[85vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-full overflow-hidden">
        
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-800">Tin nhắn</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {MOCK_CONVERSATIONS.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeConv === conv.id ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-gray-800 truncate">{conv.partnerName}</h3>
                      {conv.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-green-600 font-medium truncate mb-1">{conv.matchTitle}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <FaUserCircle className="text-4xl text-gray-400" />
              <div>
                <h3 className="font-bold text-gray-800">
                  {MOCK_CONVERSATIONS.find(c => c.id === activeConv)?.partnerName}
                </h3>
                <p className="text-xs text-green-600">Đang hoạt động</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${msg.isMine ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${msg.isMine ? 'text-green-100 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-green-500 transition"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button 
              type="submit"
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition shadow-md"
            >
              <FaPaperPlane className="ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Chat;