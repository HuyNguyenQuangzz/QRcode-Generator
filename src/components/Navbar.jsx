import React, { useState } from "react";
import { Menu, Button } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { key: "/", label: "Trang chủ", path: "/" },
    { key: "about", label: "Về chúng tôi", path: "/about" },
    { key: "guide", label: "Hướng dẫn", path: "/guide" },
    { key: "contact", label: "Liên hệ", path: "/contact" },
    // { key: "login", label: "Đăng nhập", path: "/login" },
    // { key: "register", label: "Đăng ký", path: "/register" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-gray-800">
              Tạo QR Code VietQR
            </a>
          </div>

          {/* Menu trên màn hình lớn */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={`${item.key}`}
                className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Nút menu hamburger trên màn hình nhỏ */}
          <div className="md:hidden">
            <Button
              type="text"
              icon={isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-500"
            />
          </div>
        </div>

        {/* Menu cho màn hình nhỏ (hiển thị khi bấm hamburger) */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => (
                <a
                  key={item.key}
                  href={`#${item.key}`}
                  className="block text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
