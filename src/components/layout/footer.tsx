export function Footer() {
  return <footer className="bg-white text-black mt-auto pt-2">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/lovable-uploads/22f702c3-6095-4e93-be50-75d861b70af2.png" alt="Easy Print Logo" className="h-10 w-auto object-contain" style={{
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
            }} />
              <span className="font-bold text-lg tracking-tight text-black">
                EASY PRINT
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Sport Ecosystem Viet Nam
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Chuyên thiết kế và in ấn áo thi đấu bóng đá chất lượng cao với dịch vụ chuyên nghiệp.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Liên hệ</h3>
            <address className="text-sm not-italic text-gray-700">
              <p>Ngõ 1295 Giải Phóng</p>
              <p>Thịnh Liệt, Hoàng Mai, Hà Nội</p>
              <p>Email: contact@easyprint.com.vn</p>
              <p>Điện thoại: 035 673 5729</p>
            </address>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Giờ làm việc</h3>
            <p className="text-sm text-gray-700">Thứ Hai - Thứ Sáu: 8h00 - 17h30</p>
            <p className="text-sm text-gray-700">Thứ Bảy: 8h00 - 12h00</p>
            <p className="text-sm text-gray-700">Chủ Nhật: Nghỉ</p>
          </div>
        </div>
        
        <div className="border-t border-gray-300 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Easy Print. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>;
}