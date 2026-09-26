import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false
  }
};

function send(res, status, data) {
  res.status(status).json(data);
}

function getExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1
    ? parts.pop().toLowerCase()
    : "";
}

function cleanFilename(filename) {
  return filename
    .replace(/[\/\\]/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

async function readMultipart(req) {
  const contentType =
    req.headers["content-type"] || "";

  const match =
    contentType.match(
      /boundary=(?:"([^"]+)"|([^;]+))/i
    );

  if (!match) {
    throw new Error(
      "Không tìm thấy multipart boundary"
    );
  }

  const boundary =
    match[1] || match[2];

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks);

  const separator =
    Buffer.from("--" + boundary);

  const fields = {};
  const files = [];

  let position = 0;

  while (true) {
    const start =
      body.indexOf(
        separator,
        position
      );

    if (start === -1) break;

    const headerStart =
      start + separator.length + 2;

    if (
      body
        .subarray(
          start,
          start + separator.length + 4
        )
        .toString()
        .includes("--")
    ) {
      break;
    }

    const headerEnd =
      body.indexOf(
        Buffer.from("\r\n\r\n"),
        headerStart
      );

    if (headerEnd === -1) break;

    const headers =
      body
        .subarray(
          headerStart,
          headerEnd
        )
        .toString();

    const nextBoundary =
      body.indexOf(
        separator,
        headerEnd + 4
      );

    if (nextBoundary === -1) break;

    const contentEnd =
      nextBoundary - 2;

    const content =
      body.subarray(
        headerEnd + 4,
        contentEnd
      );

    const nameMatch =
      headers.match(
        /name="([^"]+)"/i
      );

    const filenameMatch =
      headers.match(
        /filename="([^"]*)"/i
      );

    const typeMatch =
      headers.match(
        /Content-Type:\s*([^\r\n]+)/i
      );

    if (nameMatch) {

      const fieldName =
        nameMatch[1];

      if (filenameMatch) {

        files.push({
          fieldName,
          filename:
            filenameMatch[1],
          contentType:
            typeMatch
              ? typeMatch[1].trim()
              : "application/octet-stream",
          buffer: content
        });

      } else {

        fields[fieldName] =
          content.toString("utf8");

      }
    }

    position =
      nextBoundary;
  }

  return {
    fields,
    files
  };
}

export default async function handler(req, res) {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  /*
   * OPTIONS
   */

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /*
   * GET = TEST API
   */

  if (req.method === "GET") {

    return send(res, 200, {
      success: true,
      api: "FFVN.TGM IMAGE API",
      status: "online",
      message:
        "API đang hoạt động!",
      blob:
        process.env.BLOB_READ_WRITE_TOKEN
          ? "ĐÃ CẤU HÌNH"
          : "CHƯA CẤU HÌNH",
      endpoint:
        "/api/upload",
      method:
        "POST"
    });
  }

  /*
   * CHỈ POST
   */

  if (req.method !== "POST") {

    return send(res, 405, {
      success: false,
      message:
        "Chỉ hỗ trợ GET và POST"
    });
  }

  /*
   * KIỂM TRA TOKEN
   */

  if (
    !process.env.BLOB_READ_WRITE_TOKEN
  ) {

    return send(res, 500, {
      success: false,
      errorCode:
        "MISSING_BLOB_TOKEN",
      message:
        "Chưa cấu hình BLOB_READ_WRITE_TOKEN trên Vercel."
    });
  }

  try {

    const {
      fields,
      files
    } = await readMultipart(req);

    if (!files.length) {

      return send(res, 400, {
        success: false,
        errorCode:
          "NO_FILE",
        message:
          "Không tìm thấy file ảnh."
      });
    }

    const file =
      files[0];

    const filename =
      cleanFilename(
        file.filename ||
        "image.jpg"
      );

    const extension =
      getExtension(filename);

    const allowed = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif"
    ];

    if (
      !allowed.includes(
        extension
      )
    ) {

      return send(res, 400, {
        success: false,
        errorCode:
          "INVALID_FILE",
        message:
          "Chỉ hỗ trợ JPG, JPEG, PNG, WEBP hoặc GIF."
      });
    }

    /*
     * GIỚI HẠN 8MB
     */

    if (
      file.buffer.length >
      8 * 1024 * 1024
    ) {

      return send(res, 413, {
        success: false,
        errorCode:
          "FILE_TOO_LARGE",
        message:
          "Ảnh vượt quá 8MB."
      });
    }

    /*
     * UPLOAD VERCEL BLOB
     */

    const blob =
      await put(
        `images/${filename}`,
        file.buffer,
        {
          access: "public",
          addRandomSuffix: false,
          contentType:
            file.contentType
        }
      );

    const host =
      req.headers[
        "x-forwarded-host"
      ] ||
      req.headers.host;

    const protocol =
      req.headers[
        "x-forwarded-proto"
      ] ||
      "https";

    const apiUrl =
      `${protocol}://${host}/api/upload`;

    return send(res, 200, {

      success: true,

      message:
        "Upload ảnh thành công!",

      id:
        filename,

      filename:
        filename,

      apiUrl:
        apiUrl,

      imageUrl:
        blob.url,

      size:
        file.buffer.length,

      contentType:
        file.contentType
    });

  } catch (error) {

    console.error(
      "IMAGE API ERROR:",
      error
    );

    return send(res, 500, {

      success: false,

      errorCode:
        "UPLOAD_ERROR",

      message:
        error.message ||
        "API upload bị lỗi.",

      details:
        String(error)
    });
  }
      }
