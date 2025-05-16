import React, { useState } from "react";
import { Select } from "antd";

const { Option } = Select;

const TemplateSelector = ({ onTemplateChange }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("Chỉ hiển thị QR"); // Default template

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value);
    if (onTemplateChange) {
      onTemplateChange(value); // Truyền giá trị lên component cha
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
        Template Ảnh QR
      </label>
      <Select
        value={selectedTemplate}
        onChange={handleTemplateChange}
        className="w-full"
        // dropdownMatchSelectWidth={false}
        popupMatchSelectWidth={false}
      >
        <Option value="Khung VietQR">Khung VietQR</Option>
        <Option value="Hiển thị QR kèm logo V">Hiển thị QR kèm logo V</Option>
        <Option value="Chỉ hiển thị QR">Chỉ hiển thị QR</Option>
      </Select>
    </div>
  );
};

export default TemplateSelector;
{
  /* select template QR */
}
{
  /* <h3 className="text-lg font-medium text-gray-700 mb-2">
              Chọn mẫu QR
            </h3>
            <div className="flex justify-center ">
              <Radio.Group
                defaultValue="a"
                buttonStyle="solid"
                // onChange={(e) => setBankCode(e.target.value)}
              >
                <Radio.Button value="a">Mẫu 1</Radio.Button>
                <Radio.Button value="b">Mẫu 2</Radio.Button>
                <Radio.Button value="c">Mẫu 3</Radio.Button>
              </Radio.Group>
            </div> */
}
