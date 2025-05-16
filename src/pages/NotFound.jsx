import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          404
        </h1>
        <p className="text-2xl font-semibold text-gray-800 mb-2">
          Ối! Trang không tìm thấy
        </p>
        <p className="text-gray-600 mb-6">
          Trang bạn tìm kiếm không tồn tại. Hãy quay lại trang chủ nhé!
        </p>
        <Link to="/">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition duration-300">
            Quay lại trang chủ
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
