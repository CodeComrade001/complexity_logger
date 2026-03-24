import fs from "fs";
import path from "path";

export function tempManualStorage(
  data: any,
  fileName: string = "default-result.json"
) {
  const filePath = path.resolve(
    __dirname,
    `../module/download/${fileName}`
  );

  let existingData: any[] = [];

  // Read existing file if it exists
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Error reading existing file:", err);
    }
  }

  // Append new data
  existingData.push(data);

  // Write back to file
  try {
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
}