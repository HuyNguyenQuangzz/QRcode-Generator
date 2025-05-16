import React from "react";

const Guide = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Hướng Dẫn Sử Dụng
        </h1>
        <ol className="list-decimal list-inside text-gray-700 space-y-4">
          <li>Chọn ngân hàng thụ hưởng từ danh sách thả xuống.</li>
          <li>
            Nhập số tài khoản, số tiền, tên người thụ hưởng và nội dung thanh
            toán (nếu có).
          </li>
          <li>Chọn mẫu mã QR mong muốn từ trình chọn mẫu.</li>
          <li>Nhấn nút "Tạo QR" để tạo mã QR mới.</li>
          <li>
            Tải mã QR về máy hoặc xem chi tiết giao dịch bằng cách nhấp vào từng
            dòng để xem chi tiết.
          </li>
          <li>(Tùy chọn) Tải lên file Excel để tạo nhiều mã QR cùng lúc.</li>
        </ol>
        <p className="mt-6 text-gray-700">
          Nếu bạn gặp vấn đề, vui lòng liên hệ qua{" "}
          <a href="/lien-he" className="text-blue-600">
            Liên Hệ
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Guide;
