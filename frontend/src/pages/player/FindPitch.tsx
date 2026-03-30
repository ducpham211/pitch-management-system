import { useState, useEffect } from 'react';
import PitchCard from '../../components/common/PitchCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface Field {
  id: string;
  name: string;
  type: string;
  coverImage: string | null;
  status: string;
}

const FindPitch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  
  
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axios.get(`${API_URL}/fields`);
        const fieldData = response.data.content || response.data;
        setFields(fieldData);
      } catch (error) {
        console.error('Lỗi khi tải danh sách sân:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, []);

  
  const filteredPitches = fields.filter((pitch) => {
    const matchName = pitch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tất cả' || (pitch.type && pitch.type.includes(filterType));
    return matchName && matchType;
  });

  const handleBookClick = (pitchId: string) => {
    navigate(`/san/${pitchId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tìm kiếm sân bóng</h1>
          <p className="text-gray-600">Lựa chọn sân phù hợp với đội của bạn</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Tên sân..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaFilter />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer w-full sm:w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Tất cả">Tất cả loại sân</option>
              <option value="5">Sân 5 người</option>
              <option value="7">Sân 7 người</option>
              <option value="11">Sân 11 người</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Đang tải danh sách sân...</p>
        </div>
      ) : filteredPitches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              id={pitch.id}
              name={pitch.name}
              coverImage={pitch.coverImage}
              // Tạm thời fix cứng location và price vì Entity Field của BE chưa có 2 cột này
              location="Cơ sở chính" 
              type={`Sân ${pitch.type}`}
              price="Liên hệ"
              onActionClick={() => handleBookClick(pitch.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">
            Không tìm thấy sân bóng nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      )}
    </div>
  );
};

export default FindPitch;