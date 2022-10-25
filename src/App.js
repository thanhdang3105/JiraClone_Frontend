import './App.css';
import { Route, Routes } from 'react-router-dom';
import Authentication from './components/Authen';
import HomePage from './components/home';
import ProjectsPage from './components/home/projects';

function App() {

  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/projects/*" element={<ProjectsPage />} />
        </Routes>
    </div>
  );
}

export default App;
