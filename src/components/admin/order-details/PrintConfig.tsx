
import { Order } from "@/types";

interface PrintConfigProps {
  printConfig: Order['printConfig'];
}

export const PrintConfig = ({ printConfig }: PrintConfigProps) => {
  return (
    <div>
      <h3 className="font-semibold">Cấu hình in</h3>
      <p><span className="text-muted-foreground">Font:</span> {printConfig.font}</p>
      <p><span className="text-muted-foreground">Chất liệu in lưng:</span> {printConfig.backMaterial}</p>
      <p><span className="text-muted-foreground">Màu in lưng:</span> {printConfig.backColor}</p>
      <p><span className="text-muted-foreground">Chất liệu in mặt trước:</span> {printConfig.frontMaterial}</p>
      <p><span className="text-muted-foreground">Màu in mặt trước:</span> {printConfig.frontColor}</p>
    </div>
  );
};
