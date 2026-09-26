export default async function handler(req, res) {

  if (req.method !== "GET") {

    return res.status(405).json({
      success: false,
      error: "Method không được hỗ trợ"
    });

  }


  const imageUrl =
    req.query.url;


  if (!imageUrl) {

    return res.status(400).json({

      success: false,

      error:
        "Thiếu tham số url",

      example:
        "/api/image?url=IMAGE_URL"

    });

  }


  try {

    const response =
      await fetch(imageUrl);


    if (!response.ok) {

      return res.status(
        response.status
      ).json({

        success: false,

        error:
          "Không tải được ảnh."

      });

    }


    const contentType =
      response.headers.get(
        "content-type"
      ) || "image/png";


    const arrayBuffer =
      await response.arrayBuffer();


    const buffer =
      Buffer.from(arrayBuffer);


    res.setHeader(
      "Content-Type",
      contentType
    );


    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );


    return res.status(200).send(buffer);


  } catch (error) {

    return res.status(500).json({

      success: false,

      error:
        "IMAGE_PREVIEW_FAILED",

      message:
        error.message

    });

  }

}
