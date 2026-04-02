import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import Button from '../../components/common/Button';
import axios from 'axios';

interface Pitch {
	id: string;
	name: string;
	type: string;
	coverImage: string | null;
	status: string;
}

interface TimeSlot {
	timeSlotId: string;
	startTime: string;
	endTime: string;
	price: number;
	status: string;
}

type CheckoutLocationState = {
	pitch: Pitch;
	slot: TimeSlot;
};

const Checkout = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const state = location.state as CheckoutLocationState;

	const [paymentMethod, setPaymentMethod] = useState<'momo' | 'stripe'>('momo');
	const [isProcessing, setIsProcessing] = useState(false);

	const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

	if (!state || !state.pitch || !state.slot) {
		navigate('/tim-san');
		return null;
	}

	const { pitch, slot } = state;
	const depositAmount = slot.price * 0.3;

	const formatTime = (timeStr: string) => {
		if (timeStr.includes('T')) {
			return timeStr.split('T')[1].substring(0, 5);
		}
		return timeStr.substring(0, 5);
	};

	const formatDate = (timeStr: string) => {
		if (timeStr.includes('T')) {
			const parts = timeStr.split('T')[0].split('-');
			return `${parts[2]}/${parts[1]}/${parts[0]}`;
		}
		return 'Chưa xác định';
	};

	const handlePaymentSubmit = async () => {
		setIsProcessing(true);
		const token = localStorage.getItem('accessToken');

		if (!token) {
			alert('Vui lòng đăng nhập để thực hiện đặt sân!');
			navigate('/dang-nhap');
			return;
		}

		try {
			const config = {
				headers: { Authorization: `Bearer ${token}` },
			};

			const requestBody = {
				timeSlotId: slot.timeSlotId,
				note: `Thanh toán qua ${paymentMethod}`,
			};

			const response = await axios.post(`${API_URL}/bookings`, requestBody, config);

			alert('🎉 Đặt sân thành công! ' + (response.data.message || ''));
			navigate('/ho-so');
		} catch (error: any) {
			console.error(error);
			alert('Lỗi đặt sân: ' + (error.response?.data?.message || 'Đã xảy ra lỗi kết nối.'));
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-6"
			>
				<FaArrowLeft /> Quay lại
			</button>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
					<h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
						Xác nhận thông tin
					</h2>

					<div className="space-y-4 text-gray-700">
						<div>
							<p className="text-sm text-gray-500">Tên sân</p>
							<p className="text-lg font-semibold">{pitch.name}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Khu vực</p>
							<p className="font-medium">Cơ sở chính</p>
						</div>
						<div className="flex justify-between bg-green-50 p-4 rounded-lg mt-4 border border-green-100">
							<div>
								<p className="text-sm text-green-600 font-medium">Thời gian đá</p>
								<p className="text-lg font-bold text-gray-800">
									{formatTime(slot.startTime)} - {formatTime(slot.endTime)}
								</p>
								<p className="text-sm text-gray-600">Ngày: {formatDate(slot.startTime)}</p>
							</div>
						</div>
					</div>

					<div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
						<div className="flex justify-between text-gray-600">
							<span>Tổng tiền sân:</span>
							<span className="font-medium">
								{slot.price.toLocaleString('vi-VN')}đ
							</span>
						</div>
						<div className="flex justify-between text-lg font-bold text-gray-800 pt-2">
							<span>Số tiền cần cọc (30%):</span>
							<span className="text-green-600">
								{depositAmount.toLocaleString('vi-VN')}đ
							</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
					<h2 className="text-2xl font-bold text-gray-800 mb-6">
						Phương thức thanh toán
					</h2>

					<div className="space-y-4 mb-8">
						<label
							className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
							onClick={() => setPaymentMethod('momo')}
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xl">
									<FaMoneyBillWave />
								</div>
								<div>
									<p className="font-bold text-gray-800">Ví MoMo</p>
									<p className="text-xs text-gray-500">Quét mã QR qua ứng dụng</p>
								</div>
							</div>
							{paymentMethod === 'momo' && (
								<FaCheckCircle className="text-pink-500 text-xl" />
							)}
						</label>

						<label
							className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
							onClick={() => setPaymentMethod('stripe')}
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
									<FaCreditCard />
								</div>
								<div>
									<p className="font-bold text-gray-800">Thẻ Quốc Tế / Stripe</p>
									<p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
								</div>
							</div>
							{paymentMethod === 'stripe' && (
								<FaCheckCircle className="text-green-500 text-xl" />
							)}
						</label>
					</div>

					<Button
						variant="primary"
						className={`w-full py-4 text-lg font-bold shadow-md flex justify-center items-center ${paymentMethod === 'momo' ? '!bg-pink-600 hover:!bg-pink-700' : '!bg-green-600 hover:!bg-green-700'}`}
						onClick={handlePaymentSubmit}
						disabled={isProcessing}
					>
						{isProcessing
							? 'Đang xử lý giao dịch...'
							: `Xác nhận Đặt sân`}
					</Button>
					<p className="text-center text-xs text-gray-400 mt-4">
						Giao dịch được mã hóa và bảo mật an toàn.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Checkout;