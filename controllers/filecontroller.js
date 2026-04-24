const File = require('../models/file');


//  Here these is for the uploading the files 
exports.uploadFile = async (req, res) => {
  try {
    console.log("➡️ File upload started");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = await File.create({
      userId: req.body.userId,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      format: req.file.mimetype,
      createdBy: req.body.createdBy
    });

    console.log("✅ File saved in DB");

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: newFile
    });

  } catch (error) {
    console.log("❌ Upload error:", error.message);

    res.status(500).json({
      success: false,
      message: "File upload failed"
    });
  }
};

//  Here these is for the gettting all the user 
exports.getUserFiles = async (req, res) => {
  try {
    console.log("➡️ Get user files");

    // 🔥 ALWAYS take from token
    const userId = req.user.id;

    // ❌ Ignore any query userId
    if (req.query.userId) {
      console.log("⚠️ Ignoring userId from query:", req.query.userId);
    }

    const files = await File.find({ userId });
     if(!files){
      console.log("NO matching files found ");
      
     }else{
      console.log("files there ");
      
     }
     console.log(files.length);
     
    res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      data: files
    });

  } catch (error) {
    console.log("❌ Fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch files"
    });
  }
};

//  Here we will give a Forced  Download for the Called API 
exports.downloadFile = async (req, res) => {
  try {
    console.log("➡️ Download API called");

    const userId = req.user.id;     // 🔐 from token
    const fileId = req.params.id;   // 📄 file id
    console.log('TAKEN BOTH USERID AND FILEID ');
    
    // 1. find file
    const file = await File.findById(fileId);
    console.log('FILE FOUND SCUCESSFULL');
    

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    // 2. ownership check 🔥
    if (file.userId.toString() !== userId) {
      console.log("UserId Mismatch");
      
      return res.status(403).json({
        success: false,
        message: "You are not allowed to download this file"
      });
    }
   
    

    // 3. file path
    const filePath = path.join(__dirname, '..', file.fileUrl);

    console.log("📥 Downloading:", filePath);

    // 4. FORCE DOWNLOAD 🔥
    res.download(filePath, file.fileName);

  } catch (error) {
    console.log("❌ Download error:", error.message);

    res.status(500).json({
      success: false,
      message: "Download failed"
    });
  }
};