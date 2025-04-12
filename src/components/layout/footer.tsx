
export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Jersey Design Studio</h3>
            <p className="text-sm">
              Chuyên thiết kế và in ấn áo thi đấu bóng đá chất lượng cao với dịch vụ chuyên nghiệp.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <address className="text-sm not-italic">
              <p>123 Đường ABC, Quận XYZ</p>
              <p>TP. Hồ Chí Minh, Việt Nam</p>
              <p>Email: contact@jerseydesign.vn</p>
              <p>Điện thoại: 0123 456 789</p>
            </address>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Giờ làm việc</h3>
            <p className="text-sm">Thứ Hai - Thứ Sáu: 8h00 - 17h30</p>
            <p className="text-sm">Thứ Bảy: 8h00 - 12h00</p>
            <p className="text-sm">Chủ Nhật: Nghỉ</p>
          </div>
        </div>
        
        <div className="border-t border-muted-foreground/20 mt-6 pt-6 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Jersey Design Studio. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
