import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Về Chúng Tôi</h1>
        <p className="text-gray-700 mb-4">
          Chúng tôi là một đội ngũ phát triển đam mê tạo ra các công cụ QR Code
          tiện lợi và hiệu quả. Ứng dụng của chúng tôi được thiết kế để hỗ trợ
          người dùng trong việc tạo và quản lý mã QR một cách dễ dàng, đáp ứng
          tiêu chuẩn VietQR.
        </p>
        <p className="text-gray-700 mb-4">
          Với sứ mệnh đơn giản hóa các giao dịch và tăng cường trải nghiệm người
          dùng, chúng tôi không ngừng cải tiến sản phẩm để mang lại giá trị tốt
          nhất.
        </p>
        <p className="text-gray-700">
          Liên hệ với chúng tôi qua{" "}
          <a href="/lien-he" className="text-blue-600">
            Liên Hệ
          </a>{" "}
          để biết thêm chi tiết.
        </p>
      </div>
    </div>
  );
};

export default About;
