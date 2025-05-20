import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Button, message } from "antd";
import { BsDownload } from "react-icons/bs";
import numberToWords from "../components/numberToWords";

const TransactionDetail = ({
  transactions = [],
  selectedTemplate = "Chỉ hiển thị QR",
}) => {
  const { id } = useParams(); // Get transaction ID from URL
  //   console.log("TransactionDetail ID:", id); // Debug log
  //   console.log("Available transactions:", transactions); // Debug log

  // Find transaction by ID
  const transaction = transactions.find((t) => t.id === id);

  // Format number for display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0"; // Safeguard for undefined/null
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle QR code download
  const handleDownloadQR = (qrDataUrl, bankName) => {
    if (!qrDataUrl) return; // Prevent download if qrDataUrl is missing
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `VietQR_${bankName}_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Tải mã QR thành công!");
  };
  //   const formatDateTime = (date) => {
  //  if (!(date instanceof Date) || isNaN(date)) return "N/A"; // Safeguard for invalid date
  //     const day = String(date.getDate()).padStart(2, "0");
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const year = date.getFullYear();
  //     const hours = String(date.getHours()).padStart(2, "0");
  //     const minutes = String(date.getMinutes()).padStart(2, "0");
  //     const seconds = String(date.getSeconds()).padStart(2, "0");
  //     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  //   };
  const renderQRCodeWithTemplate = (qrCodeDataUrl = {}) => {
    // console.log("Selected template:", selectedTemplate);
    // console.log("QR code data URL:", qrCodeDataUrl);
    // console.log("Record:", record);
    // console.log("Transaction:", transaction);

    switch (selectedTemplate) {
      case "Khung VietQR":
        return (
          <div className="relative w-48 h-64">
            <img
              src={qrCodeDataUrl || ""}
              alt="QR Code"
              className="w-32 h-32 mx-auto mt-2"
            />
            <div className="w-full flex items-center justify-center mt-1">
              <span className="text-[10px] font-medium text-gray-700">
                {transaction.bankName || "Unknown Bank"}
              </span>
            </div>
            <div className="w-full text-center text-[10px] font-medium text-gray-700 mt-2">
              STK: {transaction.accountNo || "Unknown"}
            </div>
            <div className="w-full text-center text-[8px] text-gray-500 mt-1">
              Số tiền: {formatNumber(transaction.amount) || "Unknown"} VND
            </div>
          </div>
        );
      case "Hiển thị QR kèm logo V":
        return (
          <div className="relative w-48 h-64 border-2 border-blue-300 rounded-lg p-2 bg-white">
            <div className="relative w-full flex justify-center mt-2">
              <img
                src={qrCodeDataUrl || ""}
                alt="QR Code"
                className="w-32 h-32"
              />
            </div>
            <div className="w-full text-center text-[10px] text-gray-700 mt-2">
              {/* <img
                src={transaction.bankLogo}
                alt={transaction.bankName || "Unknown Bank"}
              /> */}
              {transaction.bankName || "Unknown Bank"} <br />
              {formatNumber(transaction.amount) || "Unknown"} VND
              <br />
              💵 napas 24/7
              {/* {record.bankName || "Unknown Bank"} */}
            </div>
          </div>
        );
      case "Chỉ hiển thị QR":
      default:
        return <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />;
    }
  };

  if (!transaction) {
    console.log("Transaction not found for ID:", id); // Debug log
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <Card
            style={{ marginTop: "100px", textAlign: "center" }}
            title="Lỗi"
            variant={false}
          >
            <p className="text-gray-600 mb-4">
              Giao dịch với ID <strong>{id}</strong> không tồn tại.
            </p>
            <h1>
              <span role="img" aria-label="Error" className="text-red-500">
                Bạn hãy thử thực hiện một giao dịch khác!🚫
              </span>
            </h1>
            <Link to="/">
              <Button className="mt-4" type="primary">
                Quay lại trang chủ
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card
          style={{ marginTop: "100px", textAlign: "center" }}
          title="Chi tiết giao dịch"
          variant={false}
          extra={
            <Link to="/">
              <Button type="link">Quay lại</Button>
            </Link>
          }
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Transaction Details */}
            <div className="flex-1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Ngân hàng">
                  {transaction.bankName}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  {transaction.accountNo}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  {formatNumber(transaction.amount)} VNĐ
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền (chữ)">
                  {transaction.amount ? numberToWords(transaction.amount) : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                  {transaction.addInfo || "Không có nội dung"}
                </Descriptions.Item>
              </Descriptions>
            </div>
            {/* QR Code */}
            <div className="flex-1 text-center mt-4">
              <h2 className="text-lg font-semibold mb-4">Mã QR</h2>
              <div className="flex justify-center">
                {renderQRCodeWithTemplate(transaction.qrCodeDataUrl)}
              </div>
            </div>
          </div>
          <Button
            type="primary"
            icon={<BsDownload />}
            onClick={() =>
              handleDownloadQR(transaction.qrCodeDataUrl, transaction.bankName)
            }
            className="mt-6 text-center cursor-pointer"
          >
            Tải mã QR
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail;
