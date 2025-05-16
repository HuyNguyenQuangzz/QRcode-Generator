// Hàm chuyển số thành chữ tiếng Việt

const NumberToWords = (number) => {
  const units = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  // const ones = [
  //   "",
  //   "một",
  //   "hai",
  //   "ba",
  //   "bốn",
  //   "năm",
  //   "sáu",
  //   "bảy",
  //   "tám",
  //   "chín",
  // ];
  const teens = [
    "mười",
    "mười một",
    "mười hai",
    "mười ba",
    "mười bốn",
    "mười lăm",
    "mười sáu",
    "mười bảy",
    "mười tám",
    "mười chín",
  ];
  const tens = [
    "",
    "mười",
    "hai mươi",
    "ba mươi",
    "bốn mươi",
    "năm mươi",
    "sáu mươi",
    "bảy mươi",
    "tám mươi",
    "chín mươi",
  ];
  const thousands = ["", "nghìn", "triệu", "tỷ"];

  if (number === 0) return "không đồng";
  if (number < 0) return "âm " + NumberToWords(Math.abs(number));
  if (!Number.isInteger(number)) return "Số không hợp lệ";

  let numStr = String(Math.floor(number));
  let groups = [];
  while (numStr.length > 0) {
    groups.unshift(numStr.slice(-3).padStart(3, "0"));
    numStr = numStr.slice(0, -3);
  }

  let result = "";
  for (let i = 0; i < groups.length; i++) {
    let g = groups[i];
    if (g === "000") continue;

    let hundreds = Math.floor(g / 100);
    let tensOnes = g % 100;
    let tempResult = "";

    if (hundreds > 0) {
      tempResult += ones[hundreds] + " trăm";
      if (tensOnes > 0) tempResult += " ";
    }

    if (tensOnes > 0) {
      if (tensOnes < 10) {
        tempResult += ones[tensOnes];
      } else if (tensOnes < 20) {
        tempResult += teens[tensOnes - 10];
      } else {
        let ten = Math.floor(tensOnes / 10);
        let one = tensOnes % 10;
        tempResult += tens[ten];
        if (one > 0) tempResult += " " + ones[one];
      }
    }

    if (hundreds > 0 && tensOnes === 0 && i < groups.length - 1) {
      tempResult += " lẻ";
    }

    if (tempResult.trim() !== "") {
      const unitIndex = groups.length - 1 - i;
      if (unitIndex > 0) {
        tempResult += " " + units[unitIndex];
      }
      result = tempResult.trim() + " " + result;
    }
  }

  if (groups.length === 1 || (groups.length > 1 && groups[0] === "000")) {
    result += " đồng";
  }

  return result.trim();
};

export default NumberToWords;
{
  /* <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                prefix=""
                suffix=" VNĐ"
                placeholder="Nhập số tiền"
                value={amount}
                onValueChange={(values) => {
                  const { value } = values;
                  setAmount(value);
                }}
                className="w-full"
                style={{ width: "100%" }}
              />
              {amount && (
                <p className="text-sm text-gray-600 mt-1">
                  {numberToWords(Number(amount.replace(/[^0-9]/g, "")))}
                </p>
              )} */
}
