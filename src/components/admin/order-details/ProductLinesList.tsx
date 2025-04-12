
import { Order } from "@/types";

interface ProductLinesListProps {
  productLines: Order['productLines'];
}

export const ProductLinesList = ({ productLines }: ProductLinesListProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Sản phẩm in</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Sản phẩm</th>
              <th className="p-2 text-left">Vị trí</th>
              <th className="p-2 text-left">Chất liệu</th>
              <th className="p-2 text-left">Kích thước</th>
              <th className="p-2 text-left">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {productLines.map((line) => (
              <tr key={line.id} className="border-b border-muted">
                <td className="p-2">{line.product}</td>
                <td className="p-2">{line.position}</td>
                <td className="p-2">{line.material}</td>
                <td className="p-2">{line.size}</td>
                <td className="p-2">{line.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
