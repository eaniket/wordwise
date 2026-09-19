import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Explore } from './components/Explore';
import { Reader } from './components/Reader';
import { VocabularyTest } from './components/VocabularyTest';
import { CreateStory } from './components/CreateStory';
import { Analytics } from '@vercel/analytics/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/read/:storyId" element={<Reader />} />
            <Route path="/test" element={<VocabularyTest />} />
            <Route path="/test/:storyId" element={<VocabularyTest />} />
            <Route path="/create" element={<CreateStory />} />
          </Routes>
          <Analytics />
        </div>
      </BrowserRouter>
  );
}

export default App;
