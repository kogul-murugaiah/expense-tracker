import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome';
import Expenses from './pages/Expenses';
import Monthly from './pages/Monthly';
import Yearly from './pages/Yearly';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/add-income" element={<AddIncome />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/monthly" element={<Monthly />} />
        <Route path="/yearly" element={<Yearly />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
