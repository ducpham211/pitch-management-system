import { FaMapMarkerAlt, FaFutbol, FaImage } from 'react-icons/fa';
import Button from './Button';

type PitchCardProps = {
	id: number | string;
	name: string;
	location: string;
	type: string;
	price: string;
	onActionClick?: () => void;
};

const PitchCard = ({ name, location, type, price, onActionClick }: PitchCardProps) => {
	return (
		<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col">
			<div className="h-40 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center text-gray-400 font-medium">
				<FaImage className="text-4xl mb-2" />
				<span>Hình ảnh sân bóng</span>
			</div>
			<h3 className="text-xl font-semibold text-gray-800">{name}</h3>
			<div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 flex-1">
				<p className="flex items-center gap-2">
					<FaMapMarkerAlt className="text-red-500" />
					Khu vực: <span className="font-medium text-gray-800">{location}</span>
				</p>
				<p className="flex items-center gap-2">
					<FaFutbol className="text-black" />
					Loại: <span className="font-medium text-gray-800">{type}</span>
				</p>
				<p className="text-lg text-blue-600 font-bold mt-2">{price}</p>
			</div>
			<Button variant="primary" className="w-full mt-4" onClick={onActionClick}>
				Xem Lịch Trống
			</Button>
		</div>
	);
};

export default PitchCard;
