import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Countries from "./pages/Countries";
import VisaTypes from "./pages/VisaTypes";
import Offices from "./pages/Offices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/visa-types" element={<VisaTypes />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
