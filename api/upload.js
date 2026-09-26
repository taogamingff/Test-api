import { handleUpload } from "@vercel/blob/client";


export default async function handler(
  request,
  response
) {

  /*
   * Chỉ cho phép POST.
   */
  if (
    request.method &&
    request.method !== "POST"
  ) {

    return response
      .status(405)
      .json({
        success: false,
        error: "Method Not Allowed"
      });

  }


  try {

    /*
     * Vercel Pages API đã parse JSON body.
     *
     * KHÔNG dùng:
     *
     * request.formData()
     *
     * vì đây là API handler kiểu Node.
     */
    const body =
      request.body;


    if (!body) {

      return response
        .status(400)
        .json({
          success: false,
          error:
            "Request body không tồn tại."
        });

    }


    /*
     * Tạo client upload token.
     */
    const jsonResponse =
      await handleUpload({

        body,

        request,


        /*
         * Các tùy chọn upload phải nằm
         * ở server.
         */
        onBeforeGenerateToken:
          async (
            pathname,
            clientPayload
          ) => {

            /*
             * Chỉ cho phép PNG.
             *
             * index.html đã chuyển ảnh
             * sang PNG trước khi upload.
             */
            return {

              allowedContentTypes: [
                "image/png"
              ],


              /*
               * Tên chính xác:
               *
               * images.png
               *
               * Không thêm hậu tố.
               */
              addRandomSuffix: false,


              /*
               * Cho phép upload lại
               * cùng pathname.
               */
              allowOverwrite: true,


              /*
               * Cache 60 giây.
               *
               * Vì images.png có thể được
               * thay thế bằng ảnh mới.
               */
              cacheControlMaxAge: 60,


              /*
               * Giới hạn 20 MB.
               */
              maximumSizeInBytes:
                20 * 1024 * 1024,


              /*
               * Payload tùy chọn.
               */
              tokenPayload:
                JSON.stringify({
                  app:
                    "FFVN.TGM IMAGE API"
                })

            };

          },


        /*
         * Vercel gọi callback này
         * sau khi upload hoàn tất.
         */
        onUploadCompleted:
          async ({
            blob,
            tokenPayload
          }) => {

            console.log(
              "BLOB UPLOAD COMPLETED:",
              blob.url
            );

            console.log(
              "TOKEN PAYLOAD:",
              tokenPayload
            );

          }

      });


    return response
      .status(200)
      .json(jsonResponse);


  } catch (error) {

    console.error(
      "VERCEL BLOB ERROR:",
      error
    );


    return response
      .status(400)
      .json({

        success: false,

        error:
          error?.message ||
          "Vercel Blob upload error"

      });

  }

}
