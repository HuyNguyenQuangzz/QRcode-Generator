import React, { useEffect, useState } from "react";
import { Carousel } from "antd";
import banksData from "../data/banks.json";

const Footer = () => {
  const [banks, setBanks] = useState([]);
  // Lấy danh sách ngân hàng từ file JSON khi component được mount
  useEffect(() => {
    setBanks(banksData.data); // Lấy mảng "data" từ JSON
  }, []);

  return (
    <footer className="bg-gray-100 py-5 sticky bottom-0">
      <div className="max-w-8xl  mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gray-800 font-bold text-lg mb-4">
          Áp dụng cho các ngân hàng
        </p>
        {/* Thông tin công ty */}
        {/* <div className="mb-6">
          <p className="text-gray-800 font-bold text-lg">
            CÔNG TY CỔ PHẦN HappyCat VIỆT NAM - MST: 0123456789
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Địa Chỉ: Bá Hiến, Bình Xuyên, Vĩnh Phúc, Việt Nam
            <br />
            Thông tin liên hệ: Email:{" "}
            <a
              href="happycats@vietqr.vn"
              className="text-blue-500 hover:underline"
            >
              happycats@vietqr.vn
            </a>{" "}
            Hotline:{" "}
            <span className="font-medium">1900 6234 - 09 2233 3636</span>
          </p>
        </div> */}

        {/* Carousel logo ngân hàng */}
        <div className="mb-1">
          <Carousel
            autoplay
            autoplaySpeed={1000}
            dots={false}
            slidesToShow={15}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 2,
                },
              },
            ]}
          >
            {banks.map((bank, index) => (
              <div
                key={index}
                className="flex justify-center items-center px-2"
              >
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Liên kết tải ứng dụng */}
        <div className="flex justify-between items-center flex-wrap">
          <p className="text-gray-600 text-sm">Tải ứng dụng trên cửa hàng:</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="App Store"
                className="h-8 w-auto"
              />
            </a>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-8 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
