
import * as React from "react";
import { useToast as useToastUI } from "@/components/ui/use-toast";

export { ToastAction } from "@/components/ui/toast";

export const useToast = useToastUI;

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Simplified toast API for direct usage
export const toast = {
  success: (message: string) => {
    const { toast } = useToast();
    return toast({
      title: "Success",
      description: message,
    });
  },
  error: (message: string) => {
    const { toast } = useToast();
    return toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  info: (message: string) => {
    const { toast } = useToast();
    return toast({
      title: "Info",
      description: message,
    });
  },
  warn: (message: string) => {
    const { toast } = useToast();
    return toast({
      title: "Warning",
      description: message,
    });
  },
};
