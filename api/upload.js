import { put } from "@vercel/blob";

export default async function handler(req, res) {

  // ==============================
  // GET - KIỂM TRA API
  // ==============================

  if (req.method === "GET") {

    return res.status(200).json({
      success: true,
      api: "FFVN.TGM IMAGE API",
      status: "online",
      endpoint: "/api/upload",
      method: "POST",
      store: "test-api-blob",
      message: "API đang hoạt động."
    });

  }


  // ==============================
  // CHỈ CHO PHÉP POST
  // ==============================

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });

  }


  try {

    // ==============================
    // KIỂM TRA STORE ID
    // ==============================

    const storeId =
      process.env.BLOB_READ_WRITE_TOKEN_STORE_ID ||
      process.env.BLOB_STORE_ID;


    if (!storeId) {

      return res.status(500).json({
        success: false,
        error: "BLOB_STORE_ID_MISSING",
        message:
          "Chưa tìm thấy Store ID của Vercel Blob."
      });

    }


    // ==============================
    // ĐỌC FORM DATA
    // ==============================

    const formData =
      await req.formData();


    const file =
      formData.get("file");


    if (!file) {

      return res.status(400).json({
        success: false,
        error: "NO_FILE",
        message:
          "Không tìm thấy file ảnh."
      });

    }


    // ==============================
    // KIỂM TRA FILE
    // ==============================

    if (
      typeof file.type !== "string" ||
      !file.type.startsWith("image/")
    ) {

      return res.status(400).json({
        success: false,
        error: "INVALID_IMAGE",
        message:
          "File được chọn không phải hình ảnh."
      });

    }


    // ==============================
    // GIỚI HẠN DUNG LƯỢNG
    // 10 MB
    // ==============================

    if (file.size > 10 * 1024 * 1024) {

      return res.status(413).json({
        success: false,
        error: "FILE_TOO_LARGE",
        message:
          "Ảnh tối đa 10 MB."
      });

    }


    // ==============================
    // TÊN FILE
    // ==============================

    const filename =
      "images.png";


    // ==============================
    // UPLOAD BLOB
    // ==============================

    const blob =
      await put(
        filename,
        file,
        {
          access: "public",

          storeId: storeId,

          allowOverwrite: true,

          contentType: "image/png"
        }
      );


    // ==============================
    // TẠO API PREVIEW
    // ==============================

    const protocol =
      req.headers["x-forwarded-proto"] ||
      "https";


    const host =
      req.headers.host;


    const apiUrl =
      `${protocol}://${host}/api/image`;


    // ==============================
    // TRẢ KẾT QUẢ
    // ==============================

    return res.status(200).json({

      success: true,

      filename:
        "images.png",

      originalFilename:
        file.name,

      imageUrl:
        blob.url,

      apiUrl:
        apiUrl,

      previewUrl:
        apiUrl,

      contentType:
        "image/png",

      size:
        file.size,

      store:
        "test-api-blob",

      message:
        "Upload ảnh thành công."

    });


  } catch (error) {

    console.error(
      "BLOB UPLOAD ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      error:
        "UPLOAD_FAILED",

      message:
        error?.message ||
        "Không thể upload ảnh."

    });

  }

}
