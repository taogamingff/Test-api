import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  try {
    const body = req.body;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
          ],
          maximumSizeInBytes: 4 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            source: "ffvn-tgm-image-api"
          })
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("UPLOAD COMPLETED:", blob.url);
      }
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("BLOB ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Upload failed"
    });
  }
}
