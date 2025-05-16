import React, { useRef, useState } from "react";
import { BsDownload, BsQrCode } from "react-icons/bs";
import { Select, Input, Button, message, Upload, Table } from "antd";
import banksData from "../data/banks.json"; // Import file JSON
import TemplateSelector from "./TemplateSelector";
import { FiDownload } from "react-icons/fi";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import VietQR from "../data/vietQR";
import numberToWords from "./numberToWords";
import Link from "antd/es/typography/Link";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Simple UUID generator for transaction IDs
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const { Option } = Select;

const QRGenerator = ({
  transactions = [],
  setTransactions,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [addInfo, setAddInfo] = useState("");
  // const [qrDataUrl, setQrDataUrl] = useState("");
  const banks = banksData.data; // Truy cập mảng "data" trong JSON
  // const [transactions, setTransactions] = useState([]); // Lưu danh sách giao dịch
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // For programmatic redirect

  const validateInputs = () => {
    if (!selectedBank || !accountNo || !amount) {
      message.warning("Vui lòng điền đầy đủ thông tin!");
      return false;
    }
    const amountNum = parseInt(amount.replace(/[^0-9]/g, ""));
    if (amountNum > 100000000) {
      message.warning("Số tiền phải nhỏ hơn 100 triệu VNĐ!");
      return false;
    }
    if (addInfo.length > 99) {
      message.warning("Nội dung thanh toán không được vượt quá 99 ký tự!");
      return false;
    }
    return true;
  };

  const handleDownloadAllQRCodes = async () => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      message.warning("Không có mã QR nào để tải!");
      return;
    }

    try {
      const zip = new JSZip();
      transactions.forEach((transaction, index) => {
        if (transaction.qrCodeDataUrl && transaction.id) {
          // Extract base64 data (remove "data:image/png;base64," prefix)
          const base64Data = transaction.qrCodeDataUrl.split(",")[1];
          const filename = `VietQR_${transaction.bankName}_${transaction.id}.png`;
          zip.file(filename, base64Data, { base64: true });
        } else {
          console.warn(
            `Skipping transaction ${index}: missing qrCodeDataUrl or id`,
            transaction
          );
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "VietQR_All.zip");
      message.success("Tải tất cả mã QR thành công!");
    } catch (error) {
      console.error("Error generating ZIP:", error);
      message.error("Lỗi khi tạo file ZIP!");
    }
  };
  // const createVietQrUrl = (bankCode, accountNo, amount, addInfo) => {
  //   const amountCleaned = amount.replace(/[^0-9]/g, "");
  //   return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png?amount=${amountCleaned}&addInfo=${encodeURIComponent(
  //     addInfo
  //   )}&accountName=DefaultName`;
  // };
  const generateQR = async (bankCode, account, amt, info) => {
    try {
      const bank = banks.find((b) => b.code === bankCode);
      if (!bank || !bank.bin) {
        throw new Error("Không tìm thấy thông tin ngân hàng!");
      }

      const vietQR = new VietQR();
      vietQR
        .setBeneficiaryOrganization(bank.bin, account)
        .setTransactionAmount(amt.replace(/[^0-9]/g, ""))
        .setAdditionalDataFieldTemplate(info || "Thanh toan");

      const qrString = vietQR.build();
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "L",
        margin: 1,
        width: 200,
      });

      const transaction = {
        id: generateUUID(), // Ensure unique ID
        qrCodeDataUrl,
        bankName: bank.shortName,
        accountNo: account,
        amount: amt,
        addInfo: info,
      };
      // console.log("Generated transaction:", transaction); // Debug log
      return transaction;
    } catch (error) {
      throw new Error(`Lỗi khi tạo mã QR: ${error.message}`);
    }
  };
  const handleGenerateQR = async () => {
    if (!validateInputs()) return;

    if (typeof setTransactions !== "function") {
      console.error("setTransactions is not a function:", setTransactions);
      message.error(
        "Không thể cập nhật giao dịch. Vui lòng kiểm tra cấu hình."
      );
      return;
    }

    try {
      const transaction = await generateQR(
        selectedBank,
        accountNo,
        amount,
        addInfo
      );
      console.log("Current transactions:", transactions);
      const currentTransactions = Array.isArray(transactions)
        ? transactions
        : [];
      setTransactions([...currentTransactions, transaction]);
      message.success("Tạo mã QR thành công!");
      // Optional: Redirect to detail page after QR generation
      navigate(`/transaction/${transaction.id}`);
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
  };
  const handleDownloadQR = (qrDataUrl, index) => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `VietQR_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Tải mã QR thành công!");
  };

  const handleExcelUpload = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const newTransactions = [];
        for (const [index, row] of jsonData.entries()) {
          const bankCode = row["BANK_CODE"];
          const account = row["ACCOUNT_NO"]?.toString();
          const amount = Math.round(Number(row["AMOUNT"]))?.toString();
          const info = row["ADD_INFO"] || "";

          if (!bankCode || !account || !amount) {
            message.warning(`Dòng ${index + 1}: Thiếu thông tin bắt buộc!`);
            continue;
          }

          try {
            const transaction = await generateQR(
              bankCode,
              account,
              amount,
              info
            );
            newTransactions.push(transaction);
            message.success(`Tạo QR cho dòng ${index + 1} thành công!`);
          } catch (error) {
            message.error(`Dòng ${index + 1}: ${error.message}`);
          }
        }
        if (typeof setTransactions !== "function") {
          console.error("setTransactions is not a function:", setTransactions);
          message.error(
            "Không thể cập nhật giao dịch. Vui lòng kiểm tra cấu hình."
          );
          return;
        }

        // console.log("Current transactions before update:", transactions);
        // setTransactions([...transactions, ...newTransactions]);
        // console.log("Current transactions before update:", transactions); // Debug log
        const currentTransactions = Array.isArray(transactions)
          ? transactions
          : [];
        setTransactions([...currentTransactions, ...newTransactions]);
      };
      reader.readAsArrayBuffer(file);
      return false; // Ngăn Upload tự động gửi file
    } catch (error) {
      console.error("Lỗi khi xử lý file Excel:", error);
      message.error("Không thể xử lý file Excel!");
    }
  };
  const renderQRCodeWithTemplate = (qrCodeDataUrl, record = {}) => {
    // console.log("Selected template:", selectedTemplate);
    // console.log("QR code data URL:", qrCodeDataUrl);
    // console.log("Record:", record);

    const bank = banks.find((b) => b.shortName === record.bankName) || {
      logo: "",
      shortName: "Unknown",
      name: "Unknown",
    };
    const bankLogo = bank ? bank.logo : "";
    switch (selectedTemplate) {
      case "Khung VietQR":
        return (
          <div className="relative w-48 h-64 border-2 border-blue-300 rounded-lg  bg-white">
            <div className="relative w-48 h-64 justify-center">
              <img
                src={qrCodeDataUrl || ""}
                alt="QR Code"
                className="w-32 h-32 mx-auto mt-5"
              />
              <div className="w-full flex items-center justify-center mt-1">
                <img
                  src={bankLogo}
                  alt={record.bankName || "Unknown Bank"}
                  className="w-6 h-4 mr-1"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="text-[10px] font-medium text-gray-700">
                  {record.bankName || "Unknown Bank"}
                </span>
              </div>
              <div className="w-full text-center text-[10px] font-medium text-gray-700 mt-2">
                STK: {record.accountNo || "Unknown"}
              </div>
              <div className="w-full text-center text-[8px] text-gray-500 mt-1">
                Số tiền: {formatNumber(record.amount) || "Unknown"} VND
              </div>
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
              <img src={bankLogo} alt={record.bankName || "Unknown Bank"} />
              {formatNumber(record.amount) || "Unknown"} VND 💵 napas 24/7
              {/* {record.bankName || "Unknown Bank"} */}
            </div>
          </div>
        );
      case "Chỉ hiển thị QR":
      default:
        return <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />;
    }
  };

  const columns = [
    // adding STT
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankName",
      key: "bankName",
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNo",
      key: "accountNo",
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount",
      key: "amount",
      render: (text) => formatNumber(text),
    },
    // {
    //   title: "Số tiền bằng chữ",
    //   dataIndex: "amount",
    //   key: "amountWords",
    //   render: (text) => numberToWords(parseInt(text.replace(/[^0-9]/g, ""))),
    // },
    {
      title: "Nội dung",
      dataIndex: "addInfo",
      key: "addInfo",
      render: (text) => (text.length > 20 ? text.slice(0, 5) + "..." : text),
    },
    {
      title: "Mã QR",
      key: "qrCode",
      // render: (_, record) => (
      //   <img src={record.qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
      // ),
      render: (text, record) =>
        renderQRCodeWithTemplate(record.qrCodeDataUrl, record),
    },
    {
      title: "Tải QR",
      key: "download",
      render: (_, record, index) => (
        <Button
          icon={<BsDownload />}
          onClick={() => handleDownloadQR(record.qrCodeDataUrl, index)}
        >
          Tải
        </Button>
      ),
    },
    // {
    //   title: "Chi tiết",
    //   key: "details",
    //   render: (_, record) => (
    //     <Link to={`/transactions/${record.id}`}>Chi tiết</Link>
    //   ),
    // },
  ];
  // Debug: Log transactions to check for missing IDs
  // console.log("Rendering Table with transactions:", transactions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Tạo QR Code VietQR
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Công cụ tạo QR Code online chuẩn VietQR. Phù hợp để hiển thị trên
          website, ứng dụng, ngân hàng.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngân hàng thụ hưởng (*)
              </label>
              <Select
                showSearch
                placeholder="Chọn hoặc tìm ngân hàng"
                optionFilterProp="children"
                onChange={(value) => setSelectedBank(value)}
                value={selectedBank}
                className="w-full"
                filterOption={(input, option) => {
                  const bank = banks.find((b) => b.code === option.value);
                  if (!bank) return false;
                  return (
                    bank.name.toLowerCase().includes(input.toLowerCase()) ||
                    bank.shortName.toLowerCase().includes(input.toLowerCase())
                  );
                }}
              >
                {banks.map((bank) => (
                  <Option key={bank.code} value={bank.code}>
                    <div className="flex items-center">
                      <img
                        src={bank.logo}
                        alt={bank.shortName}
                        className="w-12 h-5 mr-2"
                      />
                      <span className="text-red-600 mr-2">★</span>
                      <span>
                        {bank.shortName} - {bank.name}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tài khoản (*)
              </label>
              <Input
                placeholder="Nhập số tài khoản"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền (VNĐ)
              </label>
              <Input
                placeholder="Nhập số tiền (dưới 100 triệu)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                suffix="VNĐ"
                type="number"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung thanh toán
              </label>
              <Input
                placeholder="Nhập nội dung  (dưới 99 ký tự)"
                value={addInfo}
                onChange={(e) => setAddInfo(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tải file Excel
              </label>
              <Upload
                accept=".xlsx, .xls"
                beforeUpload={handleExcelUpload}
                showUploadList={false}
              >
                <Button>Chọn file Excel</Button>
              </Upload>
              <p className="text-sm text-gray-500 mt-1">
                File Excel cần có các cột: BANK_CODE, ACCOUNT_NO, AMOUNT,
                ADD_INFO
              </p>
            </div>

            <div className="col-span-2">
              <TemplateSelector onTemplateChange={setSelectedTemplate} />
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              type="primary"
              size="large"
              icon={<BsQrCode />}
              onClick={handleGenerateQR}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Tạo QR
            </Button>
          </div>

          {/* {qrDataUrl && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Mã QR VietQR
              </h3>
              <div className="flex justify-center">
                <img src={qrDataUrl} alt="VietQR" />
              </div>
              <p className="mt-2 text-gray-600">
                Trong đó:
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  <li>SỐ TÀI KHOẢN: Số tài khoản ngân hàng (bắt buộc).</li>
                  <li>
                    NGÂN HÀNG: Code ngân hàng hoặc Short Name của ngân hàng (bắt
                    buộc). Đánh số tiền, nội dung thanh toán.
                  </li>
                  <li>SỐ TIỀN: Số tiền cần chuyển khoản.</li>
                  <li>NOI DUNG: Nội dung chuyển khoản.</li>
                  <li>
                    TEMPLATE: Template cho ảnh QR (để trống, compact hoặc chỉ).
                  </li>
                  <li>DOWNLOAD: Tải QR về máy (true để tải về).</li>
                </ul>
              </p>
              <p className="mt-4 text-gray-600">Nhúng vào website của bạn:</p>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                <code>&lt;img src="{qrDataUrl}" alt="VietQR" /&gt;</code>
              </pre>
            </div>
          )} */}
        </div>

        {Array.isArray(transactions) && transactions.length > 0 && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Danh sách giao dịch
              </h2>
              <Button
                type="primary"
                icon={<FiDownload />}
                onClick={handleDownloadAllQRCodes}
              >
                Tải tất cả mã QR
              </Button>
            </div>

            <Table
              className="w-full cursor-pointer"
              columns={columns}
              dataSource={transactions}
              rowKey={(record) => record.id || `fallback-${Math.random()}`} // Fallback key
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/transaction/${record.id}`),
                // Navigate to detail page console.log("Row data:", record), // Debug log
              })}
            />
          </div>
        )}

        {/* <p className="text-center text-gray-500 mt-6">© HappyCat 2025.</p> */}
      </div>
    </div>
  );
};

export default QRGenerator;
