
const numberToWords = (num) => {
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
    "",
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

  if (num === 0) return "Không đồng";

  let words = "";
  let unitIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      let chunkWords = "";
      if (chunk >= 100) {
        chunkWords += units[Math.floor(chunk / 100)] + " trăm ";
        const remainder = chunk % 100;
        if (remainder > 0) {
          if (remainder < 10) {
            chunkWords += "lẻ " + units[remainder] + " ";
          } else if (remainder < 20) {
            chunkWords += teens[remainder - 10] + " ";
          } else {
            chunkWords += tens[Math.floor(remainder / 10)] + " ";
            if (remainder % 10 > 0) {
              chunkWords += units[remainder % 10] + " ";
            }
          }
        }
      } else if (chunk >= 10) {
        if (chunk < 20) {
          chunkWords += teens[chunk - 10] + " ";
        } else {
          chunkWords += tens[Math.floor(chunk / 10)] + " ";
          if (chunk % 10 > 0) {
            chunkWords += units[chunk % 10] + " ";
          }
        }
      } else {
        chunkWords += units[chunk] + " ";
      }
      chunkWords += thousands[unitIndex] + " ";
      words = chunkWords + words;
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  return words.trim() + " đồng";
};

export default numberToWords;
