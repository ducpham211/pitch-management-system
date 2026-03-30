import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import Button from '../../components/common/Button';
import { type Pitch, type TimeSlot } from '../../mocks/pitchData';

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

	if (!state || !state.pitch || !state.slot) {
		navigate('/tim-san');
		return null;
	}

	const { pitch, slot } = state;
	const depositAmount = slot.price * 0.3;

	const handlePaymentSubmit = () => {
		setIsProcessing(true);

		setTimeout(() => {
			setIsProcessing(false);
			alert(
				'🎉 Đặt sân và thanh toán cọc thành công! Mã giao dịch: VN-' +
					Math.floor(Math.random() * 1000000),
			);
			navigate('/');
		}, 2000);
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
			>
				<FaArrowLeft /> Quay lại
			</button>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{}
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
							<p className="font-medium">{pitch.location}</p>
						</div>
						<div className="flex justify-between bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
							<div>
								<p className="text-sm text-blue-600 font-medium">Thời gian đá</p>
								<p className="text-lg font-bold text-gray-800">
									{slot.startTime} - {slot.endTime}
								</p>
								<p className="text-sm text-gray-600">Ngày: {slot.date}</p>
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
							<span className="text-blue-600">
								{depositAmount.toLocaleString('vi-VN')}đ
							</span>
						</div>
					</div>
				</div>

				{}
				<div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
					<h2 className="text-2xl font-bold text-gray-800 mb-6">
						Phương thức thanh toán
					</h2>

					<div className="space-y-4 mb-8">
						{}
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

						{}
						<label
							className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
							onClick={() => setPaymentMethod('stripe')}
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
									<FaCreditCard />
								</div>
								<div>
									<p className="font-bold text-gray-800">Thẻ Quốc Tế / Stripe</p>
									<p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
								</div>
							</div>
							{paymentMethod === 'stripe' && (
								<FaCheckCircle className="text-blue-500 text-xl" />
							)}
						</label>
					</div>

					<Button
						variant="primary"
						className={`w-full py-4 text-lg font-bold shadow-md flex justify-center items-center ${paymentMethod === 'momo' ? '!bg-pink-600 hover:!bg-pink-700' : ''}`}
						onClick={handlePaymentSubmit}
						disabled={isProcessing}
					>
						{isProcessing
							? 'Đang xử lý giao dịch...'
							: `Thanh Toán ${depositAmount.toLocaleString('vi-VN')}đ`}
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
