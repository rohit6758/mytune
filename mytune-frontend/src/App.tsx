import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Create from './pages/Create';
import Library from './pages/Library';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/discover" replace />} />
          <Route path="discover" element={<Discover />} />
          <Route path="search"   element={<Search />} />
          <Route path="create"   element={<Create />} />
          <Route path="library"  element={<Library />} />
          <Route path="profile"  element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
