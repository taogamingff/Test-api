import { put } from "@vercel/blob";

/*
  FFVN.TGM IMAGE API

  POST /api/upload
  Nhận binary image
  -> lưu thành images.png
  -> trả về URL ảnh

  GET /api/upload
  -> kiểm tra API
*/

export async function GET() {
  return Response.json({
    success: true,
    name: "FFVN.TGM IMAGE API",
    status: "online",
    endpoint: "/api/upload",
    uploadMethod: "POST",
    message: "API đang hoạt động."
  });
}

export async function POST(request) {
  try {

    /*
      Kiểm tra Content-Type
    */

    const contentType =
      request.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      return Response.json(
        {
          success: false,
          error: "INVALID_IMAGE",
          message: "Dữ liệu gửi lên phải là file ảnh."
        },
        { status: 400 }
      );
    }


    /*
      Đọc ảnh dạng binary.
      KHÔNG dùng request.formData()
    */

    const arrayBuffer =
      await request.arrayBuffer();


    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return Response.json(
        {
          success: false,
          error: "EMPTY_FILE",
          message: "Không nhận được ảnh."
        },
        { status: 400 }
      );
    }


    /*
      Giới hạn 4MB cho cách upload
      qua Vercel Function này.
    */

    const maxSize = 4 * 1024 * 1024;

    if (arrayBuffer.byteLength > maxSize) {
      return Response.json(
        {
          success: false,
          error: "FILE_TOO_LARGE",
          message:
            "Ảnh quá lớn. Hãy chọn ảnh dưới 4MB."
        },
        { status: 413 }
      );
    }


    /*
      TỰ ĐẶT TÊN
    */

    const filename = "images.png";


    /*
      Upload lên Vercel Blob.

      addRandomSuffix: false
      => giữ đúng tên images.png

      allowOverwrite: true
      => upload ảnh mới sẽ thay ảnh cũ
    */

    const blob = await put(
      filename,
      arrayBuffer,
      {
        access: "public",
        contentType: contentType,
        addRandomSuffix: false,
        allowOverwrite: true
      }
    );


    /*
      URL API hiện tại
    */

    const url =
      new URL(request.url);


    const apiUrl =
      `${url.origin}/api/upload`;


    /*
      TRẢ KẾT QUẢ
    */

    return Response.json({
      success: true,

      filename: "images.png",

      imageUrl: blob.url,

      apiUrl: apiUrl,

      contentType: contentType,

      size: arrayBuffer.byteLength,

      message:
        "Upload ảnh thành công."
    });

  } catch (error) {

    console.error(
      "IMAGE API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,

        error: "UPLOAD_FAILED",

        message:
          error?.message ||
          "Không thể upload ảnh."
      },
      { status: 500 }
    );
  }
}
