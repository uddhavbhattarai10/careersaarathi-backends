const multer = require("multer");
const fs = require("fs");
const path = require("path");

const destinationFolder = "../uploads"; // Define destination folder

// Ensure that the destination folder exists, create it if it doesn't
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const uploadPDF = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = uploadPDF;
