export default function handler(req, res) {
  const events = [
    {
      id: 1,
      title: "Sự kiện Free Fire",
      description: "Đây là API thử nghiệm đầu tiên của tôi",
      banner: "https://via.placeholder.com/1200x500",
      region: "vn",
      startTime: "2026-09-26T00:00:00+07:00",
      endTime: "2026-09-30T23:59:59+07:00"
    },
    {
      id: 2,
      title: "Sự kiện Kim Cương",
      description: "Thử nghiệm dữ liệu API",
      banner: "https://via.placeholder.com/1200x500",
      region: "vn",
      startTime: "2026-09-27T00:00:00+07:00",
      endTime: "2026-10-05T23:59:59+07:00"
    }
  ];

  res.status(200).json({
    success: true,
    message: "API hoạt động bình thường!",
    region: "vn",
    total: events.length,
    events: events
  });
}
