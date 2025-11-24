import { AppProvider, useApp } from './context/AppContext';
import Landing from './screens/Landing';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import CreateRide from './screens/CreateRide';
import SearchRide from './screens/SearchRide';
import MyRides from './screens/MyRides';
import RideDetails from './screens/RideDetails';
import Chat from './screens/Chat';
import GPSTracking from './screens/GPSTracking';
import Profile from './screens/Profile';
import RideHistory from './screens/RideHistory';
import Rating from './screens/Rating';
import Platform from './screens/Platform';
import Cities from './screens/Cities';
import Safety from './screens/Safety';
import RideConfirmation from './screens/RideConfirmation';
import Vehicles from './screens/Vehicles';
import Chatbot from './components/Chatbot';



function AppRouter() {
  const { currentScreen } = useApp();

  const screens: Record<string, JSX.Element> = {
    landing: <Landing />,
    login: <Login />,
    signup: <Signup />,
    dashboard: <Dashboard />,
    'create-ride': <CreateRide />,
    'search-ride': <SearchRide />,
    'my-rides': <MyRides />,
    'ride-details': <RideDetails />,
    chat: <Chat />,
    'gps-tracking': <GPSTracking />,
    profile: <Profile />,
    'ride-history': <RideHistory />,
    rating: <Rating />,
    platform: <Platform />,
    cities: <Cities />,
    safety: <Safety />,
    'ride-confirmation': <RideConfirmation />,
    vehicles: <Vehicles />,
  };

  return screens[currentScreen] || <Landing />;
}



function App() {
  return (
    <AppProvider>
      <AppRouter />
      <ChatbotWrapper />
    </AppProvider>
  );
}

function ChatbotWrapper() {
  const { authToken, currentScreen } = useApp();

  // Show chatbot only when authenticated and on the dashboard
  if (!authToken || currentScreen !== 'dashboard') {
    return null;
  }

  return <Chatbot />;
}

export default App;
