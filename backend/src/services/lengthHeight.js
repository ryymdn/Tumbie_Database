const reference = require("./lengthHeightReference.json");
const { fullMonths } = require("./weightForAge");

function lookup(table, gender, value) {
  const data = reference[table][gender];
  if (!data) return null;
  return data.rows[(value - data.start) / data.step] ?? null;
}

function assessLengthHeight({ birthDate, examDate, gender, height, weight, position }) {
  if (!["lying", "standing"].includes(position) || height == null) return {};
  const cm = Number(height);
  if (!Number.isFinite(cm) || cm <= 0) return {};
  const age = fullMonths(birthDate, examDate);
  if (age == null || age < 0 || age > 60) return {};
  const useLength = age <= 24;
  const tenths = Math.round(cm * 10)
    + (useLength && position === "standing" ? 7 : !useLength && position === "lying" ? -7 : 0);
  const correctedCm = tenths / 10;
  const lengthHeightLimits = lookup(useLength ? "length" : "height", gender, age);
  if (!lengthHeightLimits) return {};
  const [veryShort, short, tall] = lengthHeightLimits;
  const heightForAge = {
    indicator: useLength ? "PB/U" : "TB/U",
    correctedCm,
    status: correctedCm < veryShort ? "Sangat pendek"
      : correctedCm < short ? "Pendek"
      : correctedCm <= tall ? "Normal"
      : "Tinggi",
  };
  const weightLimits = lookup(useLength ? "weightLength" : "weightHeight", gender, tenths);
  if (!weightLimits) return { heightForAge };
  const kg = Number(weight);
  if (!Number.isFinite(kg) || kg <= 0) return { heightForAge };
  const [severe, low, risk, high, obesity] = weightLimits;
  const weightForHeight = {
    indicator: useLength ? "BB/PB" : "BB/TB",
    status: kg < severe ? "Gizi buruk"
      : kg < low ? "Gizi kurang"
      : kg <= risk ? "Gizi baik"
      : kg <= high ? "Berisiko gizi lebih"
      : kg <= obesity ? "Gizi lebih"
      : "Obesitas",
  };
  return { heightForAge, weightForHeight };
}

module.exports = { assessLengthHeight };
