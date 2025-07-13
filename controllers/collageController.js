// controllers/collageController.js

// Import your Supabase client
const supabase = require("../Supabase/supabase"); // Adjust path as needed

// Optional: Import the Mongoose model
const Collage = require("../models/Collage"); // Adjust path as needed

const uploadCollageImages = async (req, res) => {
  try {
    // 🔹 Example of additional field(s) sent via req.body
    const { collageName } = req.body;

    console.log("collarge image data ", req.body);
    if (!collageName) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a collage name.",
      });
    }

    // 🔹 `req.files` will hold all the images sent by the client
    const images = req.files;
    if (!images || images.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No images uploaded.",
      });
    }

    let imageUrls = [];

    // 🔹 Loop over each file in `req.files` and upload to Supabase
    for (const image of images) {
      // Generate a unique file name
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.jpg`;

      console.log("image filename", fileName);

      // Folder path inside your Supabase bucket
      const folderName = "desinaar/collageImages";
      const filePath = `${folderName}/${fileName}`;

      try {
        // Upload to Supabase
        const { data, error: uploadError } = await supabase.storage
          .from("3gContent") // Replace with your bucket name
          .upload(filePath, image.buffer, {
            contentType: image.mimetype,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError.message);
          throw new Error(uploadError.message);
        }

        if (!data || !data.path) {
          throw new Error("Invalid upload response from Supabase.");
        }

        // Construct the public URL
        const SUPABASE_URL =
          "https://ewppyeqhqylgauppwvjd.supabase.co/storage/v1/object/public";
        const bucketName = "3gContent"; // Your bucket name
        const publicUrl = `${SUPABASE_URL}/${bucketName}/${data.path}`;

        imageUrls.push(publicUrl);
      } catch (uploadException) {
        console.error("Upload process failed:", uploadException.message);
        throw new Error(uploadException.message);
      }
    }

    // 🔹 Optionally, store in MongoDB
    const collageDoc = new Collage({
      collageName,
      imageUrls,
    });
    await collageDoc.save();

    // 🔹 Return success
    return res.status(201).json({
      status: "success",
      message: "Collage images uploaded successfully!",
      data: collageDoc, // or just `imageUrls` if you don't use a DB
    });
  } catch (error) {
    console.error("Error in uploadCollageImages:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Error uploading collage images",
      error: error.message,
    });
  }
};

module.exports = {
  uploadCollageImages,
};
