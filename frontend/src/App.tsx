import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/player/Home';
import FindPitch from './pages/player/FindPitch';
import PitchDetail from './pages/player/PitchDetail';
import Checkout from './pages/player/Checkout';

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/tim-san" element={<FindPitch />} />
					<Route path="/san/:id" element={<PitchDetail />} />
					<Route path="/thanh-toan" element={<Checkout />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
