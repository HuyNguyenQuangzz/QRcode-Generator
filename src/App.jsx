import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Home from "./pages/Home";
import NewForm from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import QRGenerator from "./components/QRGenerator";
import TransactionDetail from "./pages/TransactionDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Guide from "./pages/Guide";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("Chỉ hiển thị QR"); // Default template
  return (
    <>
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewForm />} />
          <Route
            path="/transaction"
            element={
              <QRGenerator
                transactions={transactions}
                setTransactions={setTransactions}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
            }
          />
          <Route
            path="/transaction/:id"
            element={
              <TransactionDetail
                transactions={transactions}
                selectedTemplate={selectedTemplate}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
};

export default App;
