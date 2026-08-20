// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ManufacturerDashboard from './pages/ManufacturerDashboard'
import LabDashboard from './pages/LabDashboard'
import RegulatorDashboard from './pages/RegulatorDashboard'
import DistributorDashboard from './pages/DistributorDashboard'

// Placeholder dashboard components (you'll build these next)
//const ManufacturerDashboard = () => <h1>Manufacturer Dashboard</h1>;
// const LabDashboard = () => <h1>Lab Dashboard</h1>;
// const RegulatorDashboard = () => <h1>Regulator Dashboard</h1>;
//const DistributorDashboard = () => <h1>Distributor Dashboard</h1>;
const PharmacyDashboard = () => <h1>Pharmacy Dashboard</h1>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Role-Based Routes — uncomment as you build each dashboard */}
          <Route path="/manufacturer" element={
            <ProtectedRoute allowedRoles={['MANUFACTURER']}>
              <ManufacturerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/lab" element={
            <ProtectedRoute allowedRoles={['LAB']}>
              <LabDashboard />
            </ProtectedRoute>
          } />
          <Route path="/regulator" element={
            <ProtectedRoute allowedRoles={['REGULATOR']}>
              <RegulatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/distributor" element={
            <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
              <DistributorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['PHARMACY']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          } />

          {/* Redirect root to login (since we don't have a public homepage) */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all: redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;