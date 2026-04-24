const File = require('../models/file');
const path = require('path'); 
const fs = require('fs');


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


exports.renameFile = async (req, res) => {
  try {
    console.log("➡️ Rename file API called");

    const userId = req.user.id;
    const fileId = req.params.id;
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "fileName is required"
      });
    }

    // 1. find file
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    // 2. ownership check
    if (file.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    // 3. OLD file path
    const oldPath = path.join(__dirname, '..', file.fileUrl);

    // 4. NEW file name (keep extension)
    const ext = path.extname(file.fileName);
    const newFileName = fileName + ext;

    const newPath = path.join(__dirname, '..', 'uploads', newFileName);

    console.log("Old:", oldPath);
    console.log("New:", newPath);

    // 5. Rename file physically
    fs.renameSync(oldPath, newPath);

    // 6. Update DB
    file.fileName = newFileName;
    file.fileUrl = `/uploads/${newFileName}`;
    await file.save();

    console.log("✅ File renamed successfully");

    res.status(200).json({
      success: true,
      message: "File renamed successfully",
      data: file
    });

  } catch (error) {
    console.log("❌ Rename error:", error.message);

    res.status(500).json({
      success: false,
      message: "Rename failed"
    });
  }
};


exports.getFileAnalytics = async (req, res) => {
  try {
    console.log("➡️ File analytics API called");

    let { startDate, endDate } = req.query;

    // 🔹 build match filter
    let matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};

      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    console.log("📅 Date filter:", matchStage);

    const data = await File.aggregate([

      // 🔥 apply filter here
      { $match: matchStage },

      {
        $group: {
          _id: "$userId",
          fileCount: { $sum: 1 },
          uniqueFiles: { $addToSet: "$fileName" },
          latestFileDate: { $max: "$createdAt" }
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },

      {
        $unwind: "$user"
      },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: "$user.name",
          fileCount: 1,
          uniqueFiles: 1,
          distinctFileCount: { $size: "$uniqueFiles" },
          createdAt: "$latestFileDate"
        }
      }

    ]);

    console.log("✅ Analytics fetched:", data.length);

    res.status(200).json({
      success: true,
      message: "File analytics fetched successfully",
      count: data.length,
      data
    });

  } catch (error) {
    console.log("❌ Analytics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};
