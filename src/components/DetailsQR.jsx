import { Button, Descriptions, Modal } from "antd";
import React, { useEffect, useState } from "react";
import numberToWords from "./numberToWords";
import { BsDownload } from "react-icons/bs";

const DetailsQR = ({ record, open, setShowDetails, next, pre, space }) => {
  const selectedTemplate = "Chỉ hiển thị QR";
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0"; // Safeguard for undefined/null
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
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
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.key === " ") {
        space();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [record]);
  return (
    <Modal
      title="Chi tiết giao dịch"
      className="!w-[800px]"
      open={open}
      footer={[
        <div className="flex items-center mt-5" key="btn">
          <div className="flex gap-1 mr-auto">
            <Button onClick={() => pre()}>Trước đó</Button>
            <Button onClick={() => next()} type="primary">
              Tiếp theo
            </Button>
          </div>
          <div className="flex mt-2 text-[#999]">
            Bấm dấu cách để đánh dấu đã xử lý và sang mã tiếp theo
          </div>
        </div>,
      ]}
      onClose={() => setShowDetails(false)}
      onCancel={() => setShowDetails(false)}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Ngân hàng">
              {record.bankName}
            </Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">
              {record.accountNo}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {formatNumber(record.amount)} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền (chữ)">
              {record.amount ? numberToWords(record.amount) : ""}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {record.addInfo || "Không có nội dung"}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className="flex flex-col gap-2 w-[220px] items-center">
          <div>Mã QRCode</div>
          {record?.complete && (
            <div className="px-4 py-1 uppercase border-green-600 border-1 text-white bg-green-600 text-center rounded-md">
              Đã xử lý
            </div>
          )}
          <div className="mt-2">
            {renderQRCodeWithTemplate(record.qrCodeDataUrl)}
          </div>
          <Button
            type="primary"
            icon={<BsDownload />}
            onClick={() =>
              handleDownloadQR(record.qrCodeDataUrl, record.bankName)
            }
            className="mt-auto text-center cursor-pointer"
          >
            Tải mã QR
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsQR;
