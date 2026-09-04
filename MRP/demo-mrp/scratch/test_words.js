const numberToWords = (n) => {
  if (n === 0) return "Zero";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  const convertThreeDigit = (num) => {
    let str = "";
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      str += teens[num - 10] + " ";
    } else {
      if (num >= 20) {
        str += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        str += units[num] + " ";
      }
    }
    return str;
  };

  let word = "";
  let i = 0;
  let tempN = n;
  while (tempN > 0) {
    if (tempN % 1000 !== 0) {
      word = convertThreeDigit(tempN % 1000) + scales[i] + " " + word;
    }
    tempN = Math.floor(tempN / 1000);
    i++;
  }
  return word.trim();
};

console.log(numberToWords(77945));
