import { put } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "API chỉ hỗ trợ POST"
    });
  }

  try {
    const { filename, data } = req.body || {};

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên file"
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu ảnh"
      });
    }

    /*
     * Chỉ cho phép ảnh
     */
    const ext = filename
      .split(".")
      .pop()
      .toLowerCase();

    const allowed = [
      "jpg",
      "jpeg",
      "png",
      "webp"
    ];

    if (!allowed.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng ảnh không được hỗ trợ"
      });
    }

    /*
     * Làm sạch tên file
     */
    const safeName = filename
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    /*
     * Lấy Base64
     */
    const base64 = data.replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    );

    const buffer = Buffer.from(
      base64,
      "base64"
    );

    /*
     * Giới hạn 4MB
     */
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Ảnh quá lớn. Vui lòng chọn ảnh dưới 4MB."
      });
    }

    /*
     * Upload Vercel Blob
     */
    const blob = await put(
      `images/${safeName}`,
      buffer,
      {
        access: "public",
        addRandomSuffix: false
      }
    );

    /*
     * URL API hiện tại
     */
    const host =
      req.headers["x-forwarded-host"] ||
      req.headers.host;

    const protocol =
      req.headers["x-forwarded-proto"] ||
      "https";

    const apiUrl =
      `${protocol}://${host}/api/upload`;

    return res.status(200).json({
      success: true,

      message: "Upload thành công",

      id: safeName,

      filename: safeName,

      apiUrl: apiUrl,

      imageUrl: blob.url,

      data: {
        id: safeName,
        api: apiUrl,
        image: blob.url
      }
    });

  } catch (error) {

    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "API upload bị lỗi",
      error: error?.message || String(error)
    });
  }
      }
