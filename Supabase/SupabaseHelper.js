const supabase = require('./supabase');

const uploadImageToSupabase = async (fileBuffer, fileName) => {
  const { data, error } = await supabase.storage
    .from('3gContent') // Replace 'images' with your bucket name
        .upload(fileName, fileBuffer, { contentType: 'image/jpeg' });
    
//     const { data, error } = await supabase
//   .from('student_image')
    //   .insert([{ name: 'Test Image', url: 'https://example.com/test.jpg' }]);
    
    try {
    const { data, error } = await supabase.storage
      .from('3gContent') // Replace with your bucket name
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg', // Ensure this matches your image type
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Generate the public URL for the uploaded image
    const { publicUrl } = supabase.storage
      .from('3gContent') // Replace with your bucket name
            .getPublicUrl(data.path);
        
        console.log("public url", publicUrl);

    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded image.');
    }

    return publicUrl;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }


  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  // Get the public URL of the uploaded image
  const { publicUrl } = supabase.storage.from('images').getPublicUrl(fileName);
  return publicUrl;
};

module.exports = uploadImageToSupabase;