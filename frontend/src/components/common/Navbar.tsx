import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaFutbol, FaUserCircle, FaSignOutAlt, FaUser, FaBell, FaCheck, FaBellSlash, FaShieldAlt } from 'react-icons/fa';
import Button from './Button';
import PopupMessage from './PopupMessage';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);

  // State cho PopupMessage
  const [popupInfo, setPopupInfo] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMyNotifications();
      const data = res.data?.content || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  // Hàm xử lý khi bấm vào các link cần bảo vệ
  const handleProtectedLinkClick = (e: React.MouseEvent, isProtected?: boolean) => {
    if (isProtected && !user) {
      e.preventDefault(); // Ngăn chuyển trang
      setPopupInfo({
        isOpen: true,
        type: 'info',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để sử dụng tính năng này!',
        onConfirm: () => {
          closePopup();
          navigate('/login');
        }
      });
      return false;
    }
    return true;
  };

  const unreadCount = notifications.filter(n => n.read === false || n.isRead === false).length;

  // Thêm cờ isProtected cho các trang cần đăng nhập
  const navLinks = [
    { name: 'Trang Chủ', path: '/', isProtected: false },
    { name: 'Tìm Sân', path: '/pitches', isProtected: false },
    { name: 'Ghép Trận', path: '/matches', isProtected: true },
    { name: 'Tin Nhắn', path: '/messages', isProtected: true },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <FaFutbol className="text-green-600 text-3xl" />
              <span className="font-bold text-xl text-gray-800">PitchSync</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={(e) => handleProtectedLinkClick(e, link.isProtected)}
                  className={`font-medium transition-colors ${isActive(link.path) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotif(!showNotif)} className={`text-gray-500 hover:text-green-600 transition relative outline-none mt-1 p-2 rounded-full ${showNotif ? 'bg-green-50 text-green-600' : ''}`}>
                      <FaBell className="text-xl" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {showNotif && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-800 flex justify-between items-center">
                          <span>Thông báo</span>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                              <FaCheck /> Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                              <FaBellSlash className="text-3xl text-gray-200 mb-3" />
                              <p className="text-sm font-medium">Chưa có thông báo nào</p>
                            </div>
                          ) : (
                            notifications.map((n: any) => {
                              const isRead = n.read === true || n.isRead === true;
                              return (
                                <div key={n.id} onClick={() => handleRead(n.id)} className={`p-4 border-b border-gray-50 text-sm cursor-pointer transition flex items-start gap-3 ${isRead ? 'bg-white opacity-70 hover:bg-gray-50' : 'bg-green-50/40 hover:bg-green-50'}`}>
                                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${isRead ? 'bg-transparent' : 'bg-green-500'}`}></div>
                                  <div className="flex-1">
                                    <p className={`text-gray-800 ${isRead ? '' : 'font-bold'}`}>{n.title}</p>
                                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{n.content}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Hệ thống</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                    <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition py-2 px-1 outline-none">
                      <FaUserCircle className="text-2xl" />
                      <span className="font-medium truncate max-w-[120px]">{user.fullName || 'Tài khoản'}</span>
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 mt-0 z-50 overflow-hidden">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"><FaUser className="text-sm" /> Hồ sơ cá nhân</Link>
                        <Link to="/teams" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"><FaShieldAlt className="text-sm" /> Quản lý đội bóng</Link>
                        {(user.role === 'OWNER' || user.role === 'ROLE_OWNER') && <Link to="/owner" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"><FaFutbol className="text-sm" /> Kênh Chủ Sân</Link>}
                        {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"><FaCheck className="text-sm" /> Quản Trị Hệ Thống</Link>}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition"><FaSignOutAlt className="text-sm" /> Đăng xuất</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"><Button variant="secondary" className="bg-transparent border border-gray-300">Đăng Nhập</Button></Link>
                  <Link to="/register"><Button variant="primary" className="!bg-green-600 hover:!bg-green-700">Đăng Ký</Button></Link>
                </>
              )}
            </div>
            
            <div className="md:hidden flex items-center gap-4">
               {user && (
                 <button onClick={() => setShowNotif(!showNotif)} className="text-gray-500 relative outline-none">
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                 </button>
               )}
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
                {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 absolute w-full left-0 z-40 shadow-lg">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={(e) => { 
                    const isAllowed = handleProtectedLinkClick(e, link.isProtected);
                    if (isAllowed) setIsOpen(false); // Chỉ đóng menu nếu được phép chuyển trang
                  }} 
                  className={`block px-3 py-3 rounded-md text-base font-medium ${isActive(link.path) ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-gray-100">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" className="w-full text-center border border-gray-300 py-3">Hồ sơ cá nhân</Button>
                    </Link>
                    {(user.role === 'OWNER' || user.role === 'ROLE_OWNER') && (
                      <Link to="/owner" onClick={() => setIsOpen(false)}>
                        <Button variant="secondary" className="w-full text-center border border-blue-200 text-blue-600 bg-blue-50 py-3">Kênh Chủ Sân</Button>
                      </Link>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="secondary" className="w-full text-center border border-purple-200 text-purple-600 bg-purple-50 py-3">Quản Trị Hệ Thống</Button>
                      </Link>
                    )}
                    <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="secondary" className="w-full text-center border border-red-200 text-red-600 bg-red-50 py-3">Đăng Xuất</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" className="w-full text-center border border-gray-300 py-3">Đăng Nhập</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" className="w-full text-center !bg-green-600 py-3">Đăng Ký</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Component Popup hiển thị thông báo yêu cầu đăng nhập */}
      <PopupMessage
        isOpen={popupInfo.isOpen}
        onClose={closePopup}
        type={popupInfo.type}
        title={popupInfo.title}
        message={popupInfo.message}
        onConfirm={popupInfo.onConfirm}
      />
    </>
  );
};

export default Navbar;