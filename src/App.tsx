import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Menus from './components/Menus';
import Categories from './components/Categories';
import Tables from './components/Tables';
import Reservations from './components/Reservations';
import Orders from './components/Orders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="menus" element={<Menus />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tables" element={<Tables />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
