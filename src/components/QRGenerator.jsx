import React, { useRef, useState } from "react";
import { BsDownload, BsQrCode } from "react-icons/bs";
import {
  Select,
  Input,
  Button,
  message,
  Upload,
  Table,
  Descriptions,
} from "antd";
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
import DetailsQR from "./DetailsQR";

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
  const [showDetails, setShowDetails] = useState(false);
  const [detailID, setDetailID] = useState({});
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [addInfo, setAddInfo] = useState("");
  const [fileName, setFileName] = useState(null);
  const banks = banksData.data; // Truy cập mảng "data" trong JSON
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // For programmatic redirect
  const handleNextSpace = () => {
    const index = transactions.findIndex((item) => item.id === detailID.id);
    transactions[index].complete = true;
    setTransactions([...transactions]);
    if (index + 1 >= transactions.length) return;
    setDetailID(transactions[index + 1]);
    if (transactions[index + 1]?.id) {
      const row = document.getElementById(`${transactions[index + 1].id}`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
  const validateInputs = () => {
    if (!selectedBank || !accountNo || !amount) {
      message.warning("Vui lòng điền đầy đủ thông tin!");
      return false;
    }
    const amountNum = parseInt(amount.replace(/[^0-9]/g, ""));
    if (amountNum > 1000000000) {
      message.warning("Số tiền phải nhỏ hơn 1 tỷ VNĐ!");
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
        complete: false,
        bankName: bank.shortName,
        accountNo: account,
        amount: amt,
        addInfo: info,
      };
      console.log("Generated transaction:", transaction); // Debug log
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
      setTransactions([...transactions, transaction]);
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
      setFileName(file.name);
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
        const currentTransactions = Array.isArray(transactions)
          ? transactions
          : [];
        setTransactions([...currentTransactions, ...newTransactions]);
      };
      reader.readAsArrayBuffer(file);
      return false;
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
      case "Hiển thị QR kèm logo":
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
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      className: "max-sm:text-[11px] nowrap",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankName",
      key: "bankName",
      className: "max-sm:text-[11px] nowrap",
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNo",
      key: "accountNo",
      className: "max-sm:text-[11px] nowrap",
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount",
      key: "amount",
      className: "max-sm:text-[11px] nowrap",
      render: (text) => formatNumber(text),
    },
    {
      title: "Nội dung",
      dataIndex: "addInfo",
      className: "max-sm:hidden",
      key: "addInfo",
      // render: (text) => (text.length > 20 ? text.slice(0, 5) + "..." : text),
    },
    // {
    //   title: "Mã QR",
    //   key: "qrCode",
    //   // render: (_, record) => (
    //   //   <img src={record.qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
    //   // ),
    //   render: (text, record) => (
    //     <div className="min-w-[170px]">
    //       {renderQRCodeWithTemplate(record.qrCodeDataUrl, record)}
    //     </div>
    //   ),
    // },
    {
      title: "Tải QR",
      key: "download",
      className: "max-sm:text-[11px] nowrap",
      render: (_, record, index) => (
        <Button
          icon={<BsDownload />}
          onClick={() => handleDownloadQR(record.qrCodeDataUrl, index)}
        >
          Tải
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white p-6 flex pb-[150px]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 hidden">
          Tạo QR Code VietQR
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Công cụ tạo QR Code online chuẩn VietQR.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              fileName ? "max-h-[0px]" : "max-h-[400px]"
            }`}
          >
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngân hàng (*)
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
                  placeholder="Nhập số tiền (dưới 1 tỷ)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  suffix="VNĐ"
                  type="number"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <Input
                  placeholder="Nhập nội dung (dưới 99 ký tự)"
                  value={addInfo}
                  onChange={(e) => setAddInfo(e.target.value)}
                />
              </div>
            </div>
            <div className="text-center">
              <Button
                type="primary"
                size="large"
                icon={<BsQrCode />}
                onClick={() => {
                  handleGenerateQR();
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Tạo QR
              </Button>
            </div>
            <div className="flex justify-center my-4 font-[500] text-[#999] text-[13px]">
              Hoặc
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Upload
              accept=".xlsx, .xls"
              beforeUpload={handleExcelUpload}
              showUploadList={false}
            >
              <Button className="!p-8 !border-dashed border-[#000000]">
                {fileName ?? "Chọn file Excel"}
              </Button>
            </Upload>
            <p className="text-sm text-gray-500 mt-2">
              File Excel cần có các cột: BANK_CODE, ACCOUNT_NO, AMOUNT, ADD_INFO
            </p>
          </div>
        </div>
        {Array.isArray(transactions) && transactions.length === 1 && (
          <div className="flex flex-col items-center gap-6 mt-6 bg-white p-6 rounded-lg shadow-lg">
            {amount && (
              <div className="col-span-2">
                <Select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e);
                  }}
                  className="w-full"
                  popupMatchSelectWidth={false}
                >
                  <Option value="Khung VietQR">Khung VietQR</Option>
                  <Option value="Hiển thị QR kèm logo">
                    Hiển thị QR kèm logo
                  </Option>
                  <Option value="Chỉ hiển thị QR">Chỉ hiển thị QR</Option>
                </Select>
              </div>
            )}
            <div className="flex gap-4">
              {/* <Descriptions column={1} bordered className="min-w-[600px]">
                <Descriptions.Item label="Ngân hàng">
                  {transactions[0].bankName}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  {transactions[0].accountNo}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  {formatNumber(transactions[0].amount)} VNĐ
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền (chữ)">
                  {transactions[0].amount
                    ? numberToWords(transactions[0].amount)
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                  {transactions[0].addInfo || "Không có nội dung"}
                </Descriptions.Item>
              </Descriptions> */}
              <div className="flex justify-center w-[300px]">
                {renderQRCodeWithTemplate(
                  transactions[0].qrCodeDataUrl,
                  transactions[0]
                )}
              </div>
            </div>
          </div>
        )}
        {Array.isArray(transactions) && transactions.length > 1 && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 max-sm:text-[13px]">
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
              rowClassName={(record) =>
                ` max-sm:text-[11px] ${
                  record.complete
                    ? "bg-[#ecffe5]"
                    : record.id === detailID?.id
                    ? "bg-[#e5f3ff]"
                    : ""
                }`
              }
              pagination={false}
              onRow={(record) => ({
                onClick: () => {
                  setShowDetails(true);
                  setDetailID(record);
                },
                id: `${record.id}`,
              })}
            />
          </div>
        )}
      </div>
      <DetailsQR
        record={detailID}
        open={showDetails}
        setShowDetails={setShowDetails}
        space={handleNextSpace}
        next={() => {
          const index = transactions.findIndex(
            (item) => item.id === detailID.id
          );
          if (index + 1 >= transactions.length) return;
          setDetailID(transactions[index + 1]);
        }}
        pre={() => {
          const index = transactions.findIndex(
            (item) => item.id === detailID.id
          );
          if (index - 1 < 0) return;
          setDetailID(transactions[index - 1]);
        }}
      />
    </div>
  );
};

export default QRGenerator;
