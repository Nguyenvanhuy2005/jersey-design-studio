import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo, Player, ProductLine, Customer } from "@/types";

interface OrderSummaryProps {
  teamName: string;
  players: Player[];
  logos?: Logo[];
  productLines: ProductLine[];
  uniformType: 'player' | 'goalkeeper';
  quantity: number;
  customerInfo?: Customer;
}

export function OrderSummary({
  teamName,
  players,
  logos = [],
  productLines,
  uniformType,
  quantity,
  customerInfo
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng kết đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Info */}
        <div>
          <h3 className="font-semibold mb-2">Thông tin đội bóng</h3>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Tên đội:</span> {teamName || "(Không có)"}
            </p>
            <p>
              <span className="text-muted-foreground">Loại quần áo:</span> {uniformType === 'player' ? 'Cầu thủ' : 'Thủ môn'}
            </p>
            <p>
              <span className="text-muted-foreground">Số lượng quần áo:</span> {quantity} bộ
            </p>
          </div>
        </div>
        
        <Separator />
        
        {/* Player List */}
        <div>
          <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
          {players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tên cầu thủ</th>
                    <th className="text-center py-2">Số áo</th>
                    <th className="text-center py-2">Kích thước</th>
                    <th className="text-center py-2">In hình</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={player.id || index} className="border-b border-muted">
                      <td className="py-2">{player.name || "(Không tên)"}</td>
                      <td className="text-center py-2">{player.number}</td>
                      <td className="text-center py-2">{player.size}</td>
                      <td className="text-center py-2">{player.printImage ? "Có" : "Không"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có cầu thủ nào trong danh sách</p>
          )}
        </div>
        
        <Separator />
        
        {/* Logos */}
        {logos.length > 0 && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Logo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {/* Show ALL logos, not just one */}
                {logos.map((logo, index) => (
                  <div key={logo.id || index} className="border rounded p-2 text-center">
                    <img src={logo.previewUrl || logo.url} alt={`Logo ${index + 1}`} className="h-16 w-16 object-contain mx-auto" />
                    <p className="text-xs mt-1">{getPositionLabel(logo.position)}</p>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}
        
        {/* Printing Items */}
        <div>
          <h3 className="font-semibold mb-2">Danh sách in ấn</h3>
          {productLines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Sản phẩm</th>
                    <th className="text-left py-2">Vị trí in</th>
                    <th className="text-left py-2">Chất liệu</th>
                    <th className="text-left py-2">Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  {productLines.map((line, index) => (
                    <tr key={line.id || index} className="border-b border-muted">
                      <td className="py-2">{line.product}</td>
                      <td className="py-2">{line.position}</td>
                      <td className="py-2">{line.material}</td>
                      <td className="py-2">{line.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có thông tin in ấn</p>
          )}
        </div>
        
        <Separator />
        
        {/* Customer Info */}
        {customerInfo && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <div className="grid gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Họ tên:</span> {customerInfo.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Địa chỉ:</span> {customerInfo.address}
                </p>
                <p>
                  <span className="text-muted-foreground">Số điện thoại:</span> {customerInfo.phone}
                </p>
                {customerInfo.delivery_note && (
                  <p>
                    <span className="text-muted-foreground">Ghi chú giao hàng:</span> {customerInfo.delivery_note}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get position label
function getPositionLabel(position: string): string {
  switch (position) {
    case 'chest_left': return 'Ngực trái';
    case 'chest_right': return 'Ngực phải';
    case 'chest_center': return 'Giữa ngực';
    case 'sleeve_left': return 'Tay trái';
    case 'sleeve_right': return 'Tay phải';
    case 'pants': return 'Quần';
    default: return position;
  }
}
