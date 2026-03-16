import { useState } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import PitchCard from '../../components/common/PitchCard'

const MOCK_PITCHES = [
  { id: 1, name: 'Sân bóng Chảo Lửa', location: 'Quận Tân Bình', price: '300.000đ/h', type: 'Sân 5' },
  { id: 2, name: 'Sân bóng K34', location: 'Quận Gò Vấp', price: '250.000đ/h', type: 'Sân 7' },
  { id: 3, name: 'Sân bóng Tao Đàn', location: 'Quận 1', price: '400.000đ/h', type: 'Sân 5' },
  { id: 4, name: 'Sân bóng Phú Thọ', location: 'Quận 11', price: '350.000đ/h', type: 'Sân 7' },
  { id: 5, name: 'Sân bóng Thăng Long', location: 'Quận Tân Bình', price: '280.000đ/h', type: 'Sân 5' },
  { id: 6, name: 'Sân bóng HCA', location: 'Bình Thạnh', price: '200.000đ/h', type: 'Sân 5' },
]

const FindPitch = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bộ Lọc Tìm Kiếm</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Nhập tên sân hoặc khu vực..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!mb-0"
            />
          </div>
          <div className="w-full md:w-48">
            <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white h-[42px]">
              <option value="">Tất cả loại sân</option>
              <option value="5">Sân 5 người</option>
              <option value="7">Sân 7 người</option>
              <option value="11">Sân 11 người</option>
            </select>
          </div>
          <Button variant="primary" className="w-full md:w-auto h-[42px]">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PITCHES.map(pitch => (
          <PitchCard
            key={pitch.id}
            id={pitch.id}
            name={pitch.name}
            location={pitch.location}
            type={pitch.type}
            price={pitch.price}
            onActionClick={() => console.log(`Mở modal lịch cho sân ${pitch.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default FindPitch