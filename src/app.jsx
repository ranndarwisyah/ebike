import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bike, MapPin, Route, Wallet, Lock, Clock, LocateFixed, Zap, CheckCircle, XCircle, BarChart3, Unlock, Star, Map, ArrowRight,
  User, ClipboardCheck, BookOpen, GraduationCap, Stethoscope, Home, Cloud, Building, ArrowLeft, QrCode, Wifi, CreditCard, Calendar
} from 'lucide-react';

// =====================================================
// Combined App: MyStudent Portal (main UI) + E-Bike (mockup2)
// - Portal UI is taken from mockup1 (visual portal page)
// - E-Bike app (ride, dss, wallet, rewards) follows mockup2 exactly
// - No Firebase or Gemini integration (per mockup2 behavior)
// =====================================================

// --- Configuration Constants (from mockup2) ---
const COST_PER_MINUTE_POINTS = 1000; // 1000 points = RM0.50 per minute
const POINTS_PER_RM = 2000;          // 1 RM = 2000 points (RM0.50 = 1000 pts)
const UITM_CENTER_LAT = 3.0740;
const UITM_CENTER_LON = 101.4980;
// Note: This URL is a placeholder.
const MAP_IMAGE_URL = 'https://placehold.co/400x300/FEE2E2/B91C1C?text=UiTM+Campus+Map+Mockup';

const DESIGNATED_PARKING_ZONES = [
  { id: 1, name: 'Hentian Mawar (Dc)', lat: 3.0725, lon: 101.5005 },
  { id: 2, name: 'Hentian Pusat Kesihatan', lat: 3.0735, lon: 101.5020 },
  { id: 3, name: 'Hentian Anggerik', lat: 3.0745, lon: 101.5035 },
  { id: 4, name: 'Hentian Perindu', lat: 3.0755, lon: 101.5050 },
  { id: 5, name: 'Hentian Seroja', lat: 3.0765, lon: 101.5065 },
  { id: 6, name: 'Hentian Fskm', lat: 3.0715, lon: 101.5080 },
  { id: 7, name: 'Hentian Fkpm (Mascom)', lat: 3.0705, lon: 101.5095 },
];

// --- Utility Functions (from mockup2) ---
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6373.0; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const findNearestParkingZone = (currentLat, currentLon) => {
  let minDistanceKm = Infinity;
  let nearestZone = null;

  DESIGNATED_PARKING_ZONES.forEach(zone => {
    const distKm = haversine(currentLat, currentLon, zone.lat, zone.lon);
    if (distKm < minDistanceKm) {
      minDistanceKm = distKm;
      nearestZone = zone;
    }
  });

  if (!nearestZone) {
      // Fallback in case of empty list, though the list is static.
      return { nearestZone: DESIGNATED_PARKING_ZONES[0], distanceMeters: 9999 };
  }

  return { nearestZone, distanceMeters: minDistanceKm * 1000 };
};

const getPathAnalysis = (startLoc, endLoc) => {
  const distKm = haversine(startLoc.lat, startLoc.lon, endLoc.lat, endLoc.lon);
  const baseDuration = Math.max(5, Math.floor(distKm * 50 * (Math.random() * 0.5 + 0.75)));
  const safestDuration = Math.floor(baseDuration * 1.3);
  const fastestDuration = Math.floor(baseDuration * 0.8);

  const pathData = [
    {
      profile: 'Safest',
      duration_min: safestDuration,
      safety_score: Math.floor(Math.random() * 5) + 90,
      details: 'Avoids main roads and high-traffic areas; follows pedestrian-only paths for maximum safety.',
      color: 'text-green-500',
    },
    {
      profile: 'Fastest',
      duration_min: fastestDuration,
      safety_score: Math.floor(Math.random() * 8) + 80,
      details: 'Direct route using main campus roads; optimal for quick travel but crosses more intersections.',
      color: 'text-yellow-500',
    },
  ];

  const pathsWithCost = pathData.map(path => {
    const cost = path.duration_min * COST_PER_MINUTE_POINTS;
    return {
      ...path,
      cost_points: cost,
      cost_rm: (cost / POINTS_PER_RM).toFixed(2),
    };
  });

  const fastestPath = pathsWithCost.find(p => p.profile === 'Fastest');
  // Add cheapest as a duplicate of fastest since cost is duration-dependent
  if (fastestPath) {
      pathsWithCost.push({
          profile: 'Cheapest',
          ...fastestPath,
          details: 'Same as the Fastest route, as cost is solely determined by ride duration.',
          color: 'text-blue-500',
      });
  }


  return pathsWithCost;
};

// --- Reusable UI subcomponents (kept from mockup2) ---
const MetricCard = ({ title, value, subValue, icon }) => (
    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">{title}</span>
            {icon}
        </div>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
);

const PathCard = ({ path, selected, onSelect }) => {
    const iconMap = {
        'Safest': <CheckCircle className={`w-6 h-6 ${path.color}`} />,
        'Fastest': <Zap className={`w-6 h-6 ${path.color}`} />,
        'Cheapest': <Wallet className={`w-6 h-6 ${path.color}`} />,
    };

    const handleClick = () => {
        onSelect(path.profile);
    };

    return (
        <button 
            onClick={handleClick}
            className={`w-full text-left bg-white p-4 rounded-xl shadow-lg border-2 transition duration-150 ${
                selected ? 'border-indigo-500 ring-4 ring-indigo-200' : 'border-gray-200 hover:shadow-xl'
            }`}
        >
            <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center gap-3">
                    {iconMap[path.profile]}
                    <h4 className={`text-lg font-bold ${path.color}`}>{path.profile} Path</h4>
                </div>
                {selected && <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Recommended</span>}
            </div>
            <div className="grid grid-cols-3 text-center text-sm mt-3">
                <div>
                    <p className="font-bold text-gray-800">{path.duration_min} min</p>
                    <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800">{path.cost_points.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-500">Cost</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800">{path.safety_score}%</p>
                    <p className="text-xs text-gray-500">Safety</p>
                </div>
            </div>
            <div className={`mt-3 p-3 text-xs rounded-lg border ${path.color === 'text-green-500' ? 'bg-green-50 border-green-200 text-green-700' : 
                                                                 path.color === 'text-yellow-500' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                                                                 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                {path.details}
            </div>
        </button>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 transition-colors duration-150 ${
      active ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium mt-1">{label}</span>
  </button>
);

// --- Portal UI subcomponents (from mockup1) ---
const PortalIcon = ({ icon: Icon, label, color = 'text-blue-600', onClick = () => {} }) => (
    <button 
        className="flex flex-col items-center space-y-1 w-full max-w-[80px] p-2 hover:bg-gray-50 rounded-lg transition" 
        onClick={onClick}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 border ${color === 'text-green-600' ? 'border-green-300' : 'border-blue-300'}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className="text-xs font-medium text-gray-700 text-center mt-1">{label}</span>
    </button>
);

const Banner = ({ icon: Icon, title, subtitle, color }) => (
    <div className={`p-4 rounded-xl shadow-lg flex items-center justify-between ${color} text-white`}>
        <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6" />
            <div>
                <p className="font-bold text-lg">{title}</p>
                <p className="text-sm opacity-90">{subtitle}</p>
            </div>
        </div>
        <ArrowRight className="w-5 h-5" />
    </div>
);

const BottomNavItem = ({ icon: Icon, label, active }) => (
    <button
        className={`flex flex-col items-center justify-center p-2 transition-colors duration-150 ${
            active ? 'text-indigo-600' : 'text-gray-500'
        }`}
    >
        <div className={`p-2 ${active ? 'bg-indigo-100 rounded-full shadow-inner' : ''}`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs mt-1">{label}</span>
    </button>
);

// --- Main Combined App Component ---
const APP_MODE_PORTAL = 'portal';
const APP_MODE_EBIKE = 'ebike';

export default function App() {
  // Portal state (visual only)
  const [appMode, setAppMode] = useState(APP_MODE_PORTAL);
  const [message, setMessage] = useState('');

  // E-Bike state (from mockup2)
  const [activeTab, setActiveTab] = useState('ride');
  const [uniPoints, setUniPoints] = useState(12500);
  const [rideActive, setRideActive] = useState(false);
  const [dropOffAttempted, setDropOffAttempted] = useState(false);
  const [rideStartTime, setRideStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Simulated current location
  const [currentLat, setCurrentLat] = useState(UITM_CENTER_LAT);
  const [currentLon, setCurrentLon] = useState(UITM_CENTER_LON);

  const [startLocation, setStartLocation] = useState(DESIGNATED_PARKING_ZONES[0].name);
  const [dssStart, setDssStart] = useState(DESIGNATED_PARKING_ZONES[0].name);
  const [dssEnd, setDssEnd] = useState(DESIGNATED_PARKING_ZONES[1].name);
  const [selectedPathProfile, setSelectedPathProfile] = useState('Safest');
  const [isSimulatedCorrectlyParked, setIsSimulatedCorrectlyParked] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (rideActive) {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else if (!rideActive && elapsedSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [rideActive, elapsedSeconds]);

  // Derived state calculations (using useMemo for optimization)
  const currentMinutes = useMemo(() => Math.floor(elapsedSeconds / 60), [elapsedSeconds]);
  const currentPointsCost = useMemo(() => currentMinutes * COST_PER_MINUTE_POINTS, [currentMinutes]);
  const currentRMCost = useMemo(() => (currentPointsCost / POINTS_PER_RM).toFixed(2), [currentPointsCost]);
  const balanceAfterCharge = useMemo(() => uniPoints - currentPointsCost, [uniPoints, currentPointsCost]);
  
  // Geolocation simulation: check nearest zone
  const { nearestZone, distanceMeters } = useMemo(() => findNearestParkingZone(currentLat, currentLon), [currentLat, currentLon]);
  // The 'isSimulatedCorrectlyParked' state is for the user simulation button only
  const isAtDesignatedZone = isSimulatedCorrectlyParked || (distanceMeters <= 50);

  // DSS path analysis calculation
  const currentDSSAnalysis = useMemo(() => {
      const startZone = DESIGNATED_PARKING_ZONES.find(z => z.name === dssStart);
      const endZone = DESIGNATED_PARKING_ZONES.find(z => z.name === dssEnd);
      if (!startZone || !endZone || dssStart === dssEnd) return [];

      return getPathAnalysis(
          { lat: startZone.lat, lon: startZone.lon },
          { lat: endZone.lat, lon: endZone.lon }
      );
  }, [dssStart, dssEnd]);

  // E-bike handlers (from mockup2)
  const handleStartRide = () => {
    if (uniPoints < 1000) {
      // In a real app, this would be a modal/toast
      setMessage("Error: Please top up your UniPoints. Minimum 1000 pts required to start.");
      return;
    }
    setRideActive(true);
    setRideStartTime(Date.now());
    setElapsedSeconds(0);
    setDropOffAttempted(false);
    setIsSimulatedCorrectlyParked(false);
    // Move location to the selected start zone
    const startZone = DESIGNATED_PARKING_ZONES.find(z => z.name === startLocation);
    if (startZone) {
      setCurrentLat(startZone.lat);
      setCurrentLon(startZone.lon);
    }
    setMessage(`E-Bike UNLOCKED at ${startLocation}. Ride started.`);
  };

  const finalizeRide = () => {
    const totalCost = currentPointsCost;
    let penalty = 0;
    if (!isAtDesignatedZone) {
      penalty = 200; // Penalty for non-designated drop-off (mocked up)
    }
    const finalDeduction = totalCost + penalty;

    // Check if user has enough points even with penalty
    if (uniPoints < finalDeduction) {
        setMessage(`Payment failed! Insufficient funds to cover ${finalDeduction} pts.`);
        // Note: In a real scenario, this would trigger a debt/suspension state
        setRideActive(false); 
        return;
    }

    setUniPoints(p => p - finalDeduction);
    setRideActive(false);
    setRideStartTime(null);
    setElapsedSeconds(0);
    setActiveTab('ride');
    setDropOffAttempted(false);
    setIsSimulatedCorrectlyParked(false);

    setMessage(`Ride ended successfully! Deducted ${finalDeduction} pts (Cost: ${totalCost} pts ${penalty > 0 ? `+ Penalty: ${penalty} pts` : ''}).`);
  };

  const handleAttemptEndRide = () => {
    if (!rideActive) return;
    setDropOffAttempted(true);
    if (isAtDesignatedZone) {
        setMessage("Location confirmed! Finalizing ride and payment.");
        finalizeRide();
    } else {
        setMessage(`Drop-off attempt failed. You are ${distanceMeters.toFixed(0)}m from ${nearestZone.name}. Charging continues until bike is properly parked.`);
    }
  };

  const handleTopUp = (amountPoints) => {
    setUniPoints(p => p + amountPoints);
    setMessage(`${amountPoints.toLocaleString()} pts (RM${(amountPoints / POINTS_PER_RM).toFixed(2)}) added successfully!`);
  };

  const handleSimulateCorrectParking = () => {
      const targetZone = nearestZone;
      setCurrentLat(targetZone.lat);
      setCurrentLon(targetZone.lon);
      setIsSimulatedCorrectlyParked(true);
      setMessage(`Simulated movement to designated zone: ${targetZone.name}. You can now finalize the lock.`);
  };

  // --- Portal main page (visual) taken from mockup1 ---
  const renderPortalMainPage = () => (
      <div className="bg-gray-100 min-h-screen pb-32 font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 h-40 flex flex-col justify-end">
              <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-extrabold">MyStudent</h1>
                  <div className="flex items-center space-x-2">
                      <span className="text-sm">Hai **RANIA DARWISYAH**</span>
                      <img 
                          src="https://placehold.co/40x40/0E7490/ffffff?text=R" 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full border-2 border-white"
                      />
                  </div>
              </div>
          </div>

          {/* Main Card Grid */}
          <div className="p-4">
              <div className="bg-white rounded-xl shadow-xl -mt-20 p-6">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-6 justify-items-center">
                      <PortalIcon icon={User} label="Profil Saya" />
                      <PortalIcon icon={ClipboardCheck} label="Keputusan Peperiksaan" />
                      <PortalIcon icon={BookOpen} label="Kedai Buku" />
                      <PortalIcon icon={GraduationCap} label="MASMED2u" />

                      <PortalIcon 
                          icon={Bike} 
                          label="E-Bike Ride" 
                          color="text-green-600"
                          onClick={() => {
                              setAppMode(APP_MODE_EBIKE);
                              setActiveTab('ride');
                              setMessage('Launching E-Bike Campus App...');
                          }}
                      />

                      <PortalIcon icon={Stethoscope} label="Kesihatan" />
                      <PortalIcon icon={Home} label="Residensi" />
                      {/* Empty slots for alignment */}
                      <div className="w-20"></div>
                      <div className="w-20"></div>
                  </div>
              </div>

              {/* Banners */}
              <div className="mt-8 space-y-4">
                  <Banner icon={Cloud} title="Aduan ICT" subtitle="Laporkan aduan ICT anda" color="bg-blue-600 hover:bg-blue-700 transition" />
                  <Banner icon={Building} title="Aduan Fasiliti" subtitle="Laporkan aduan fasiliti studio" color="bg-indigo-600 hover:bg-indigo-700 transition" />
              </div>
          </div>

          <div className="p-4 mt-8">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-lg">
                  <img src="https://placehold.co/40x40/FFFFFF/545454?text=UiTM" alt="UiTM Logo" className="w-10 h-10"/>
                  <p className="text-sm font-semibold text-gray-700">Jabatan Akademik dan Antarabangsa</p>
              </div>
          </div>

          {/* Fixed Notification */}
          <div className="fixed bottom-16 left-0 right-0 bg-blue-600 text-white flex justify-between items-center px-4 py-3 text-sm font-medium shadow-2xl max-w-md mx-auto z-40 rounded-t-xl">
              <span>Terdapat kemaskini terbaru.</span>
              <button className="flex items-center space-x-1 bg-white text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  <span>Kemaskini Sekarang</span>
                  <ArrowRight className="w-3 h-3" />
              </button>
          </div>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-2xl flex justify-around items-center max-w-md mx-auto z-50">
              <BottomNavItem icon={QrCode} label="Pengimbas QR" active={false} />
              <BottomNavItem icon={Wifi} label="Wifi@UiTM" active={false} />
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center -mt-4 shadow-xl border-4 border-white">
                  <Home className="w-6 h-6" />
              </div>
              <BottomNavItem icon={CreditCard} label="Kad Digital" active={false} />
              <BottomNavItem icon={Calendar} label="Jadual Kelas" active={false} />
          </div>
      </div>
  );

  // --- E-Bike renderers (from mockup2) ---
  const Header = (title) => (
    <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
      <h1 className="text-xl font-extrabold text-gray-800">{title}</h1>
      <div className="flex items-center gap-1 p-2 bg-indigo-50 rounded-full">
        <Wallet className="w-4 h-4 text-indigo-700" />
        <span className="text-xs font-semibold text-indigo-800">{uniPoints.toLocaleString()} pts</span>
      </div>
    </div>
  );

  const renderRideTab = () => (
    <>
      {Header("E-Bike Ride")}
      <div className="p-4 space-y-4">
        <div className="bg-indigo-50 p-4 rounded-xl shadow-md border-t-4 border-indigo-500">
          <p className="text-xs font-semibold text-indigo-600 mb-1">Current Balance</p>
          <p className="text-3xl font-black text-indigo-900">{uniPoints.toLocaleString()} pts</p>
          <p className="text-sm text-gray-600">≈ RM{(uniPoints / POINTS_PER_RM).toFixed(2)}</p>
        </div>
        {!rideActive ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Lock className='w-4 h-4'/> Unlock Bike</h2>
            <div className="bg-white p-4 rounded-xl shadow-md space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Starting Location</label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                >
                  {DESIGNATED_PARKING_ZONES.map(zone => (
                    <option key={zone.id} value={zone.name}>{zone.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleStartRide}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                  disabled={uniPoints < 1000}
                >
                  <Unlock className="w-5 h-5 mr-2" /> 
                  Unlock E-Bike & Start Ride
                </button>
                {uniPoints < 1000 && <p className="text-red-500 text-sm mt-2">Minimum 1000 pts required to start.</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Clock className='w-4 h-4 text-indigo-500'/> Live Charge & Status</h2>
            <div className="grid grid-cols-2 gap-3">
                <MetricCard title="Time Elapsed" value={`${currentMinutes} min`} icon={<Clock className="w-5 h-5 text-blue-500" />} />
                <MetricCard title="Cost Rate" value="1000 pts / min" icon={<Zap className="w-5 h-5 text-red-500" />} />
                <MetricCard title="Current Cost" value={`${currentPointsCost.toLocaleString()} pts`} subValue={`~RM${currentRMCost}`} icon={<Wallet className="w-5 h-5 text-green-500" />} />
                <MetricCard title="Balance Remaining" value={`${balanceAfterCharge.toLocaleString()} pts`} subValue={`~RM${(balanceAfterCharge / POINTS_PER_RM).toFixed(2)}`} icon={<Wallet className="w-5 h-5 text-indigo-500" />} />
            </div>
            <div className={`p-4 rounded-xl shadow-md border-l-4 ${isAtDesignatedZone ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Drop-off Status
                </h3>
                {isAtDesignatedZone ? (
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4"/> Location Confirmed: You are at a Designated Zone!
                    </p>
                ) : (
                    <p className="text-sm font-semibold text-red-700">
                        Nearest Zone: **{nearestZone.name}** ({distanceMeters.toFixed(0)}m) - Non-designated drop-off incurs **200 pts penalty**.
                    </p>
                )}
            </div>
            {!dropOffAttempted && (
                <button
                    onClick={handleAttemptEndRide}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    disabled={currentMinutes === 0} // Can't end immediately
                >
                    <Lock className="w-5 h-5 mr-2" />
                    Attempt to End Ride & Lock Bike
                </button>
            )}

            {dropOffAttempted && (
                isAtDesignatedZone ? (
                    <button
                        onClick={finalizeRide}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                    >
                        <Lock className="w-5 h-5 mr-2" />
                        Finalize Lock & Pay (Auto-Lock Success)
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 rounded-lg text-sm font-semibold">
                            ⚠️ Ride is still **ACTIVE and CHARGING** until bike is properly parked. Please move the bike to **{nearestZone.name}** to lock.
                        </div>
                        <button
                            onClick={handleSimulateCorrectParking}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-yellow-800 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150"
                        >
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Simulate Moving to **{nearestZone.name}** (50m range)
                        </button>
                    </div>
                )
            )}
            <div className="text-xs text-center text-gray-500 mt-2">Simulated location: Lat {currentLat.toFixed(4)}, Lon {currentLon.toFixed(4)}.</div>
          </div>
        )}
      </div>
    </>
  );

  const renderDSSTab = () => (
    <>
      {Header("DSS Path Analysis")}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Route className='w-4 h-4'/> Compare Paths</h2>
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><LocateFixed className='w-4 h-4 text-indigo-500'/> Start Location</label>
                <select 
                  className="w-full pl-3 pr-10 py-3 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border"
                  value={dssStart}
                  onChange={(e) => setDssStart(e.target.value)}
                >
                  {DESIGNATED_PARKING_ZONES.map(zone => (
                    <option key={zone.id} value={zone.name}>{zone.name}</option>
                  ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><MapPin className='w-4 h-4 text-red-500'/> Destination</label>
                <select 
                  className="w-full pl-3 pr-10 py-3 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border"
                  value={dssEnd}
                  onChange={(e) => {
                      setDssEnd(e.target.value);
                      setSelectedPathProfile('Safest');
                  }}
                >
                  {DESIGNATED_PARKING_ZONES.filter(z => z.name !== dssStart).map(zone => (
                    <option key={zone.id} value={zone.name}>{zone.name}</option>
                  ))}
                </select>
                {dssStart === dssEnd && <p className="text-red-500 text-sm mt-1">Start and End locations must be different.</p>}
            </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Map className='w-4 h-4'/> Path Visualization (Static Map Mockup)</h3>
        <div className="flex justify-center mb-4">
             <img 
                 src= "https://uploads.onecompiler.io/43ky4y72u/43znx7g34/mapping.jpeg"
                 alt="UiTM Campus Map with Safest Path highlighted" 
                 className="rounded-xl border-4 border-gray-200 shadow-xl object-cover w-full max-w-sm"
                 onError={(e) => e.currentTarget.src = 'https://placehold.co/400x300/FEE2E2/B91C1C?text=UiTM+Campus+Map+Mockup'}
             />
        </div>
        <h3 className="text-md font-bold text-gray-800 mt-4 flex items-center gap-2"><BarChart3 className='w-4 h-4'/> System Recommendations</h3>
        {currentDSSAnalysis.length > 0 ? (
            currentDSSAnalysis.map((path, index) => (
                <PathCard 
                    key={index} 
                    path={path} 
                    selected={selectedPathProfile === path.profile}
                    onSelect={setSelectedPathProfile}
                />
            ))
        ) : (
            <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-md">Please select different start and end locations.</div>
        )}
        <div className="text-xs text-center text-gray-500 pt-4">Path visualizations use the static map image. Click a card to highlight the best choice.</div>
      </div>
    </>
  );

  const renderWalletTab = () => (
    <>
      {Header("Wallet Top-up")}
      <div className="p-4 space-y-4">
        <div className="bg-indigo-50 p-4 rounded-xl shadow-md border-t-4 border-indigo-500">
          <p className="text-xs font-semibold text-indigo-600 mb-1">Current Balance</p>
          <p className="text-3xl font-black text-indigo-900">{uniPoints.toLocaleString()} pts</p>
          <p className="text-sm text-gray-600">≈ RM{(uniPoints / POINTS_PER_RM).toFixed(2)}</p>
        </div>

        <h2 className="text-lg font-bold text-gray-800">Top-up Options</h2>
        <div className="grid grid-cols-2 gap-4">
          {[10000, 20000, 50000].map(points => (
            <button
              key={points}
              onClick={() => handleTopUp(points)}
              className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100 hover:shadow-xl transition duration-150 active:bg-indigo-50"
            >
              <p className="text-xl font-bold text-indigo-600">{points.toLocaleString()} pts</p>
              <p className="text-sm text-gray-500">RM{(points / POINTS_PER_RM).toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderRewardsTab = () => (
    <>
        {Header("Rewards & Penalties")}
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Reward System</h2>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-green-600"/> Rewards & Earnings
                </h3>
                <div className="space-y-2">
                    {[
                        { action: 'Recharge e-bike at a station', points: 500 },
                        { action: 'Park in a perfect parking spot', points: 250 },
                        { action: 'Ride completion bonus', points: 100 },
                    ].map((earn, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-lime-50 rounded-lg border border-green-200">
                            <span className="text-sm text-gray-700">{earn.action}</span>
                            <div className="text-right">
                                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold block">
                                    +{earn.points} pts
                                </span>
                                <span className="text-xs text-gray-500 mt-1 block">
                                    ≈ RM{(earn.points / POINTS_PER_RM).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <XCircle className="w-5 h-5 text-red-600"/> Penalties
                </h3>
                <div className="space-y-2">
                    {[
                        { action: 'Non-designated parking/drop-off', points: -200 },
                        { action: 'Leaving UiTM Geo-fence (Severe)', points: -5000 },
                    ].map((penalty, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                            <span className="text-sm text-gray-700">{penalty.action}</span>
                            <div className="text-right">
                                <span className="bg-red-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold block">
                                    {penalty.points} pts
                                </span>
                                <span className="text-xs text-gray-500 mt-1 block">
                                    ≈ RM{Math.abs(penalty.points / POINTS_PER_RM).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
  );

  const renderEBikeContent = () => {
    switch (activeTab) {
      case 'ride': return renderRideTab();
      case 'dss': return renderDSSTab();
      case 'wallet': return renderWalletTab();
      case 'rewards': return renderRewardsTab();
      default: return null;
    }
  };

  // --- Main render ---
  return (
    // Max-width ensures the mobile-like interface is centered and clean
    <div className="bg-gray-100 min-h-screen pb-16 max-w-md mx-auto shadow-2xl font-sans">
      {/* Simple message box (portal -> ebike feedback, and ride actions) */}
      {message && (
        <div 
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 transition-opacity duration-300"
            role="alert"
        >
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button 
                    onClick={() => setMessage('')} 
                    className="ml-4 font-bold text-xl hover:text-indigo-200 transition"
                    aria-label="Close message"
                >
                    &times;
                </button>
            </div>
        </div>
      )}

      {appMode === APP_MODE_PORTAL ? (
        renderPortalMainPage()
      ) : (
        <>
          {/* E-Bike Header (fixed at the very top of the E-Bike view) */}
          <div className="sticky top-0 bg-white p-4 shadow-md z-10 flex justify-between items-center border-b border-indigo-100">
              <h1 className="text-2xl font-extrabold text-indigo-600">E-Bike Campus</h1>
              <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-indigo-600" />
                  <span className="text-lg font-bold text-gray-800">{uniPoints.toLocaleString()} <span className="text-sm font-medium text-gray-500">pts</span></span>
              </div>
          </div>

          <div className="pb-16">
            {renderEBikeContent()}
          </div>

          {/* E-Bike Mobile Nav (fixed at the bottom) */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-2xl flex justify-around items-center max-w-md mx-auto z-50">
            <NavItem icon={Bike} label="Ride" active={activeTab === 'ride'} onClick={() => setActiveTab('ride')} />
            <NavItem icon={Route} label="DSS" active={activeTab === 'dss'} onClick={() => setActiveTab('dss')} />
            <NavItem icon={Wallet} label="Wallet" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
            <NavItem icon={Zap} label="Rewards" active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} />
            <NavItem 
                icon={ArrowLeft} 
                label="Exit Portal" 
                active={false} 
                onClick={() => {
                    setAppMode(APP_MODE_PORTAL);
                    setMessage('Exited E-Bike App. Welcome back to MyStudent.');
                }}
            />
          </div>
        </>
      )}
    </div>
  );
}
