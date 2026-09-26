import { get } from "@vercel/blob";

export default async function handler(req, res) {

  // ==============================
  // CHỈ CHO PHÉP GET
  // ==============================

  if (req.method !== "GET") {

    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });

  }


  try {

    // ==============================
    // STORE ID
    // ==============================

    const storeId =
      process.env.BLOB_READ_WRITE_TOKEN_STORE_ID ||
      process.env.BLOB_STORE_ID;


    if (!storeId) {

      return res.status(500).json({
        success: false,
        error: "BLOB_STORE_ID_MISSING",
        message:
          "Chưa tìm thấy Blob Store ID."
      });

    }


    // ==============================
    // LẤY images.png
    // ==============================

    const result =
      await get(
        "images.png",
        {
          access: "public",
          storeId: storeId
        }
      );


    if (!result || !result.stream) {

      return res.status(404).json({
        success: false,
        error: "IMAGE_NOT_FOUND",
        message:
          "Chưa có images.png trong Blob."
      });

    }


    // ==============================
    // HEADER
    // ==============================

    res.setHeader(
      "Content-Type",
      result.blob?.contentType ||
      "image/png"
    );


    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=300"
    );


    // ==============================
    // TRẢ ẢNH TRỰC TIẾP
    // ==============================

    return new Response(
      result.stream,
      {
        status: 200,
        headers: {
          "Content-Type":
            result.blob?.contentType ||
            "image/png",

          "Cache-Control":
            "public, max-age=60, s-maxage=300"
        }
      }
    );


  } catch (error) {

    console.error(
      "IMAGE API ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      error:
        "IMAGE_READ_FAILED",

      message:
        error?.message ||
        "Không thể đọc ảnh."

    });

  }

}
