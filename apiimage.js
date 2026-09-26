export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập ID ảnh"
    });
  }

  const imageUrl = `https://ffvntgm.freefirevn/image${id}.jpg`;

  res.status(200).json({
    success: true,
    id: id,
    image: imageUrl
  });
}
