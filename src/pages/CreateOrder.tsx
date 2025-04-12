import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerForm } from "@/components/player-form";
import { PrintConfigForm } from "@/components/print-config-form";
import { ProductLineTable } from "@/components/product-line-table";
import { OrderSummary } from "@/components/order-summary";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Order, Player, PrintConfig, ProductLine } from "@/types";
import { toast } from "sonner";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [previewPlayer, setPreviewPlayer] = useState<number>(0);
  const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
  
  // Form state
  const [teamName, setTeamName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    font: "Arial",
    backMaterial: "In chuyển nhiệt",
    backColor: "Đen",
    frontMaterial: "In chuyển nhiệt",
    frontColor: "Đen",
    sleeveMaterial: "In chuyển nhiệt",
    sleeveColor: "Đen",
    legMaterial: "In chuyển nhiệt",
    legColor: "Đen"
  });
  
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  
  // Handle file uploads
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);
  };

  // Generate product lines based on players
  const generateProductLines = useCallback(() => {
    if (players.length === 0) return;

    const hasPlayersWithImages = players.some(p => p.printImage);
    
    // Start with basic product lines that everyone gets (back printing)
    let newProductLines: ProductLine[] = [
      {
        id: `product-back-name-${Date.now()}`,
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: printConfig.backMaterial,
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: `product-back-number-${Date.now() + 1}`,
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: printConfig.backMaterial,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      },
      {
        id: `product-back-team-${Date.now() + 2}`,
        product: "Áo thi đấu",
        position: "Lưng dưới",
        material: printConfig.backMaterial,
        size: "Nhỏ",
        points: 1,
        content: teamName
      }
    ];
    
    // Add front printing if any player has printImage = true
    if (hasPlayersWithImages) {
      newProductLines.push({
        id: `product-front-number-${Date.now() + 3}`,
        product: "Áo thi đấu",
        position: "Mặt trước",
        material: printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: "Số áo"
      });
    }
    
    setProductLines(newProductLines);
  }, [players, teamName, printConfig]);

  // Submit order
  const submitOrder = () => {
    if (!teamName || players.length === 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin đơn hàng");
      return;
    }

    // Calculate the total cost
    let totalCost = 0;
    productLines.forEach(line => {
      const unitCost = line.position.includes("Lưng") || line.position.includes("Tay") || line.position.includes("Ống") ? 10000 : 0;
      totalCost += unitCost * players.length;
    });

    // Add logo cost if needed
    if (logoFile) {
      totalCost += 20000;
    }

    const order: Order = {
      teamName,
      players,
      logoUrl: logoPreviewUrl,
      printConfig,
      productLines,
      totalCost,
      status: "new",
      notes
    };

    console.log("Order submitted:", order);
    
    // In a real-world scenario, we'd save this to Supabase here
    // After Supabase integration, replace this with actual API call
    
    toast.success("Đơn hàng đã được gửi thành công!");
    
    // Navigate to confirmation page
    navigate("/order-confirmation", { state: { order } });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tạo đơn hàng mới</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
            <TabsTrigger value="summary">Tổng kết & Đặt hàng</TabsTrigger>
          </TabsList>
          
          {/* Step 1: Order Info */}
          <TabsContent value="info" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Tên đội bóng</Label>
                  <Input 
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nhập tên đội bóng"
                  />
                </div>
                
                <div>
                  <Label htmlFor="logoUpload">Tải lên logo đội (PNG, JPG)</Label>
                  <Input 
                    id="logoUpload"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleLogoUpload}
                  />
                  
                  {logoPreviewUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Logo preview:</p>
                      <img 
                        src={logoPreviewUrl} 
                        alt="Logo preview" 
                        className="max-h-24 border rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea 
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)"
                  />
                </div>
                
                <PrintConfigForm
                  printConfig={printConfig}
                  onPrintConfigChange={setPrintConfig}
                />
              </div>
              
              <PlayerForm 
                players={players}
                onPlayersChange={setPlayers}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Cấu hình sản phẩm in</h2>
                <Button onClick={generateProductLines}>Tạo sản phẩm in tự động</Button>
              </div>
              
              <ProductLineTable 
                productLines={productLines}
                onProductLinesChange={setProductLines}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>Hủy</Button>
              <Button onClick={() => setActiveTab("preview")}>Tiếp tục</Button>
            </div>
          </TabsContent>
          
          {/* Step 2: Preview */}
          <TabsContent value="preview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Xem trước thiết kế áo</h2>
                <p className="text-muted-foreground">
                  Xem trước thiết kế áo của bạn. Có thể kéo thả logo để điều chỉnh vị trí.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant={previewView === 'front' ? 'default' : 'outline'} 
                    onClick={() => setPreviewView('front')}
                  >
                    Mặt trước
                  </Button>
                  <Button 
                    variant={previewView === 'back' ? 'default' : 'outline'} 
                    onClick={() => setPreviewView('back')}
                  >
                    Mặt sau
                  </Button>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex justify-center">
                    <CanvasJersey 
                      teamName={teamName || "TEAM NAME"}
                      playerName={players[previewPlayer]?.name || "PLAYER"}
                      playerNumber={players[previewPlayer]?.number || 0}
                      logoUrl={logoPreviewUrl}
                      view={previewView}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Chọn cầu thủ để xem trước</h2>
                
                {players.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {players.map((player, index) => (
                      <Button 
                        key={player.id || index}
                        variant={previewPlayer === index ? 'default' : 'outline'}
                        onClick={() => setPreviewPlayer(index)}
                        className="h-auto py-2 justify-start"
                      >
                        <div className="text-left">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm opacity-80">#{player.number} - {player.size}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Chưa có cầu thủ nào trong danh sách. Vui lòng quay lại bước trước để thêm cầu thủ.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("info")}>Quay lại</Button>
              <Button onClick={() => setActiveTab("summary")}>Tiếp tục</Button>
            </div>
          </TabsContent>
          
          {/* Step 3: Summary & Order */}
          <TabsContent value="summary" className="space-y-8">
            <OrderSummary 
              teamName={teamName}
              players={players}
              productLines={productLines}
            />
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Lưu ý:</h3>
              <p className="text-yellow-700">
                Bằng việc nhấn nút "Đặt đơn hàng", bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
                Đơn hàng sẽ được xử lý trong vòng 24 giờ và bạn sẽ nhận được email xác nhận.
              </p>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>Quay lại</Button>
              <Button onClick={submitOrder}>Đặt đơn hàng</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CreateOrder;
