import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatContainer from './Components/ChatContainer';
import Register from './Components/pages/Register';
import Login from './Components/pages/Login';
import WeatherApp from './Components/WeatherApp/WeatherApp';
import Posts from './Components/BlogPost/Posts';
import AddPost from './Components/BlogPost/AddPost';
import Navbar from './Components/BlogPost/Navbar';

function App() {
  return (
    <Router>
      <div className="body">
        <Routes>
          <Route path="/" element={<ChatContainer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/weather" element={<WeatherApp/>} />
          <Route path="/posts" element={<Posts/>} />
          <Route path="/addpost" element={<AddPost />} />
          <Route path="/navbar" element={<Navbar />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;