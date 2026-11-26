const reference = require("./weightForAgeReference.json");

function fullMonths(birthDate, examDate) {
  if (!birthDate || !examDate || examDate < birthDate) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = examDate.split("-").map(Number);
  return (year - birthYear) * 12 + month - birthMonth - Number(day < birthDay);
}

function assessWeightForAge(birthDate, examDate, gender, weight) {
  const ageMonths = fullMonths(birthDate, examDate);
  const limits = reference[gender]?.[ageMonths];
  const kg = Number(weight);
  if (!limits || !Number.isFinite(kg) || kg <= 0) return null;
  const [minus3, minus2, plus1] = limits;
  const status = kg < minus3 ? "Berat badan sangat kurang"
    : kg < minus2 ? "Berat badan kurang"
    : kg <= plus1 ? "Berat badan normal"
    : "Risiko berat badan lebih";
  return { ageMonths, status };
}

module.exports = { assessWeightForAge, fullMonths };
