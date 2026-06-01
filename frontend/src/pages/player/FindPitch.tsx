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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  
  const [fields, setFields] = useState<Field[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const mapFilterToEnum = (filter: string) => {
    switch(filter) {
      case '5': return 'FIVE_A_SIDE';
      case '7': return 'SEVEN_A_SIDE';
      case '11': return 'ELEVEN_A_SIDE';
      default: return null;
    }
  };

  useEffect(() => {
    const fetchFields = async () => {
      setIsLoading(true);
      try {
        const typeEnum = mapFilterToEnum(filterType);
        const typeParam = typeEnum ? `&type=${typeEnum}` : '';
        const nameParam = debouncedSearch ? `&name=${encodeURIComponent(debouncedSearch)}` : '';
        
        const response = await axios.get(`${API_URL}/fields/page?page=${page}&size=8${typeParam}${nameParam}`);
        const fieldData = response.data.content || [];
        setFields(fieldData);
        setTotalPages(response.data.totalPages || 0);
      } catch (error) {
        console.error('Lỗi khi tải danh sách sân:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, [page, filterType, debouncedSearch, API_URL]);

  const translateFieldType = (type: string) => {
    switch(type) {
      case 'FIVE_A_SIDE': return 'Sân 5 người';
      case 'SEVEN_A_SIDE': return 'Sân 7 người';
      case 'ELEVEN_A_SIDE': return 'Sân 11 người';
      default: return type;
    }
  };

  const handleBookClick = (pitchId: string) => {
    navigate(`/pitches/${pitchId}`);
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
              onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
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
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : fields.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fields.map((pitch) => (
              <PitchCard
                key={pitch.id}
                id={pitch.id}
                name={pitch.name}
                coverImage={pitch.coverImage}
                location="Cơ sở chính" 
                type={translateFieldType(pitch.type)}
                price="Theo ca đá"
                onActionClick={() => handleBookClick(pitch.id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-gray-700 bg-white shadow-sm transition"
              >
                Trang trước
              </button>
              <span className="text-sm font-semibold text-gray-600 px-3">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-gray-700 bg-white shadow-sm transition"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
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