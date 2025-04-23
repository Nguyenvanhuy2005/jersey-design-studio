
export function Footer() {
  return (
    <footer className="bg-[#1A1F2C] text-white mt-auto pt-2">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/lovable-uploads/22f702c3-6095-4e93-be50-75d861b70af2.png"
                alt="Easy Print Logo"
                className="h-10 w-auto object-contain"
                style={{filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"}}
              />
              <span className="font-bold text-lg tracking-tight">
                EASY PRINT
              </span>
            </div>
            <p className="text-sm text-[#D6BCFA]">
              Sport Ecosystem Viet Nam
            </p>
            <p className="text-sm mt-2 text-slate-300">
              Chuyên thiết kế và in ấn áo thi đấu bóng đá chất lượng cao với dịch vụ chuyên nghiệp.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#fff]">Liên hệ</h3>
            <address className="text-sm not-italic text-slate-200">
              <p>123 Đường ABC, Quận XYZ</p>
              <p>TP. Hồ Chí Minh, Việt Nam</p>
              <p>Email: contact@jerseydesign.vn</p>
              <p>Điện thoại: 0123 456 789</p>
            </address>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#fff]">Giờ làm việc</h3>
            <p className="text-sm text-slate-200">Thứ Hai - Thứ Sáu: 8h00 - 17h30</p>
            <p className="text-sm text-slate-200">Thứ Bảy: 8h00 - 12h00</p>
            <p className="text-sm text-slate-200">Chủ Nhật: Nghỉ</p>
          </div>
        </div>
        
        <div className="border-t border-[#D6BCFA]/20 mt-6 pt-6 text-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Easy Print. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
