import { put } from "@vercel/blob";

export default async function handler(req, res) {

  /*
  ==========================================
  GET
  ==========================================
  */

  if (req.method === "GET") {

    return res.status(200).json({

      success: true,

      name: "FFVN.TGM IMAGE API",

      status: "online",

      endpoint: "/api/upload",

      method: "POST",

      message:
        "API đang hoạt động. Gửi ảnh bằng POST."

    });

  }


  /*
  ==========================================
  CHỈ CHO PHÉP POST
  ==========================================
  */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      error:
        "Method không được hỗ trợ."

    });

  }


  try {

    /*
    ==========================================
    KIỂM TRA VERCEL BLOB
    ==========================================
    */

    if (!process.env.BLOB_READ_WRITE_TOKEN) {

      return res.status(500).json({

        success: false,

        error:
          "BLOB_READ_WRITE_TOKEN_MISSING",

        message:
          "Project chưa được kết nối Vercel Blob Storage."

      });

    }


    /*
    ==========================================
    NHẬN FILE ẢNH
    ==========================================
    */

    const chunks = [];


    for await (const chunk of req) {

      chunks.push(chunk);

    }


    const buffer =
      Buffer.concat(chunks);


    if (!buffer.length) {

      return res.status(400).json({

        success: false,

        error:
          "Không nhận được dữ liệu ảnh."

      });

    }


    /*
    ==========================================
    TÊN FILE TỰ ĐỘNG
    ==========================================
    */

    const filename =
      "images.png";


    /*
    ==========================================
    XÁC ĐỊNH CONTENT TYPE
    ==========================================
    */

    const contentType =
      req.headers["content-type"] ||
      "image/png";


    /*
    ==========================================
    UPLOAD VERCEL BLOB
    ==========================================
    */

    const blob =
      await put(

        filename,

        buffer,

        {

          access: "public",

          contentType:
            contentType,

          /*
            Cho phép nhiều lần upload
            mà không ghi đè ảnh cũ.
          */

          addRandomSuffix: true,

          token:
            process.env.BLOB_READ_WRITE_TOKEN

        }

      );


    /*
    ==========================================
    API URL
    ==========================================
    */

    const protocol =
      req.headers["x-forwarded-proto"] ||
      "https";


    const host =
      req.headers.host;


    const apiUrl =
      `${protocol}://${host}/api/image?url=` +
      encodeURIComponent(blob.url);


    /*
    ==========================================
    TRẢ KẾT QUẢ
    ==========================================
    */

    return res.status(200).json({

      success: true,

      filename:
        filename,

      imageUrl:
        blob.url,

      apiUrl:
        apiUrl,

      type:
        contentType,

      message:
        "Upload ảnh thành công."

    });


  } catch (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      error:
        "UPLOAD_FAILED",

      message:
        error.message

    });

  }

}
