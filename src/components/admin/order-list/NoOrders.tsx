
import React from 'react';

type NoOrdersProps = {
  message?: string;
};

export const NoOrders = ({ message = "Không có đơn hàng nào" }: NoOrdersProps) => {
  return (
    <tr>
      <td colSpan={8} className="p-4 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  );
};
