import React, { useState } from "react";
import QRGenerator from "../components/QRGenerator";

const Home = () => {
  const [transactions, setTransactions] = useState([]); // Lưu danh sách giao dịch
  const [selectedTemplate, setSelectedTemplate] = useState(
    "Hiển thị QR kèm logo"
  ); // Lưu danh sách giao dịch
  return (
    <QRGenerator
      transactions={transactions}
      setTransactions={setTransactions}
      setSelectedTemplate={setSelectedTemplate}
      selectedTemplate={selectedTemplate}
    />
  );
};

export default Home;
