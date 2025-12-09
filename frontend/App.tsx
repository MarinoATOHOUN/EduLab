import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import MentorDashboard from './pages/MentorDashboard';
import Opportunities from './pages/Opportunities';
import AiTutor from './pages/AiTutor';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Badges from './pages/Badges';
import LearningTools from './pages/LearningTools';
import CodeSandbox from './pages/CodeSandbox';
import InteractiveAtlas from './pages/InteractiveAtlas';
import WritingWorkshop from './pages/WritingWorkshop';
import ColoringWorkshop from './pages/ColoringWorkshop';
import ScientificCalculator from './pages/ScientificCalculator';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ModalProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
                <Route path="/questions/:id" element={<ProtectedRoute><QuestionDetail /></ProtectedRoute>} />
                <Route path="/mentors" element={<ProtectedRoute><Mentors /></ProtectedRoute>} />
                <Route path="/mentors/:id" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />
                <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/ai-tutor" element={<ProtectedRoute><AiTutor /></ProtectedRoute>} />
                <Route path="/tools" element={<ProtectedRoute><LearningTools /></ProtectedRoute>} />
                <Route path="/tools/code-sandbox" element={<ProtectedRoute><CodeSandbox /></ProtectedRoute>} />
                <Route path="/tools/atlas" element={<ProtectedRoute><InteractiveAtlas /></ProtectedRoute>} />
                <Route path="/tools/writing" element={<ProtectedRoute><WritingWorkshop /></ProtectedRoute>} />
                <Route path="/tools/coloring" element={<ProtectedRoute><ColoringWorkshop /></ProtectedRoute>} />
                <Route path="/tools/calculator" element={<ProtectedRoute><ScientificCalculator /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </HashRouter>
        </ModalProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;