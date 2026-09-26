import { put } from "@vercel/blob";

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Chỉ hỗ trợ POST"
    });
  }

  try {
    const {
      filename,
      contentType,
      data
    } = req.body || {};

    // Kiểm tra dữ liệu
    if (!filename || !data) {
      return res.status(400).json({
        success: false,
        message: "Thiếu filename hoặc data"
      });
    }

    // Làm sạch tên file
    const safeName = filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".");

    // Chuyển Base64 thành Buffer
    const base64 = data.replace(/^data:[^;]+;base64,/, "");

    const buffer = Buffer.from(base64, "base64");

    // Giới hạn 4MB
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn 4MB."
      });
    }

    // Upload lên Vercel Blob
    const blob = await put(
      `images/${safeName}`,
      buffer,
      {
        access: "public",
        contentType: contentType || "image/jpeg",
        addRandomSuffix: false
      }
    );

    return res.status(200).json({
      success: true,
      message: "Upload thành công!",
      id: safeName,
      filename: safeName,
      url: blob.url
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Upload thất bại",
      error: error.message
    });
  }
}
