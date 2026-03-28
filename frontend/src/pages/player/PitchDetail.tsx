import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PITCHES, MOCK_SLOTS, type TimeSlot } from '../../mocks/pitchData';
import { FaMapMarkerAlt, FaFutbol, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Button from '../../components/common/Button';

const PitchDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const pitchId = Number(id);
	const pitch = MOCK_PITCHES.find((p) => p.id === pitchId);

	const today = new Date().toISOString().split('T')[0];
	const [selectedDate, setSelectedDate] = useState<string>(today);
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

	if (!pitch) {
		return (
			<div className="container mx-auto px-4 py-20 text-center">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Không tìm thấy thông tin sân
				</h2>
				<Button variant="primary" onClick={() => navigate('/tim-san')}>
					Quay lại tìm sân
				</Button>
			</div>
		);
	}

	const availableSlots = MOCK_SLOTS.filter(
		(slot) => slot.pitchId === pitchId && slot.date === selectedDate,
	);

	const handleBooking = () => {
		if (!selectedSlot) return;

		navigate('/thanh-toan', {
			state: {
				pitch: pitch,
				slot: selectedSlot,
			},
		});
	};
	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<button
				onClick={() => navigate('/tim-san')}
				className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
			>
				<FaArrowLeft /> Quay lại danh sách
			</button>

			<div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">{pitch.name}</h1>
				<div className="flex flex-col md:flex-row gap-4 text-gray-600 mb-6">
					<p className="flex items-center gap-2">
						<FaMapMarkerAlt className="text-red-500" />
						<span>{pitch.location}</span>
					</p>
					<p className="flex items-center gap-2">
						<FaFutbol className="text-black" />
						<span>{pitch.type}</span>
					</p>
				</div>
				<p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
					* Mô tả chi tiết sân sẽ được hiển thị ở đây. Hệ thống chiếu sáng đạt chuẩn, mặt
					cỏ nhân tạo chất lượng cao, có khu vực căng tin và bãi giữ xe rộng rãi.
				</p>
			</div>

			<div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
				<h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
					<FaCalendarAlt className="text-blue-500" /> Chọn lịch trống
				</h2>

				{}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ngày đặt sân
					</label>
					<input
						type="date"
						value={selectedDate}
						onChange={(e) => {
							setSelectedDate(e.target.value);
							setSelectedSlot(null);
						}}
						className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				{}
				{availableSlots.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
						{availableSlots.map((slot) => {
							const isSelected = selectedSlot?.id === slot.id;
							return (
								<button
									key={slot.id}
									disabled={slot.isBooked}
									onClick={() => setSelectedSlot(slot)}
									className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${
						slot.isBooked
							? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
							: isSelected
								? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
								: 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
					}
                  `}
								>
									<span className="font-bold text-lg">
										{slot.startTime} - {slot.endTime}
									</span>
									<span
										className={`text-sm mt-1 ${slot.isBooked ? 'text-gray-400' : isSelected ? 'text-blue-600 font-medium' : 'text-green-600'}`}
									>
										{slot.isBooked
											? 'Đã đặt'
											: `${slot.price.toLocaleString('vi-VN')}đ`}
									</span>
								</button>
							);
						})}
					</div>
				) : (
					<div className="text-center py-10 bg-gray-50 rounded-xl mb-8">
						<p className="text-gray-500">
							Chưa có lịch trống nào được cập nhật cho ngày này.
						</p>
					</div>
				)}

				{}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
					<div className="text-left w-full sm:w-auto">
						<p className="text-sm text-gray-500 mb-1">Tổng tiền cọc dự kiến (30%)</p>
						<p className="text-2xl font-bold text-blue-600">
							{selectedSlot
								? `${(selectedSlot.price * 0.3).toLocaleString('vi-VN')}đ`
								: '0đ'}
						</p>
					</div>
					<Button
						variant="primary"
						className="w-full sm:w-auto px-8 py-3 text-lg"
						onClick={handleBooking}
						disabled={!selectedSlot}
					>
						Thanh Toán Đặt Cọc
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PitchDetail;
