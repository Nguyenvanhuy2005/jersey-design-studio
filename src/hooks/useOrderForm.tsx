
import { useState, useEffect } from "react";
import { Player, Logo, PrintConfig, ProductLine, DesignData, Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseDateSafely } from "@/utils/format-utils";
import { toast } from "sonner";

export const useOrderForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [isDemoApproved, setIsDemoApproved] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagesPreview, setReferenceImagesPreview] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: "",
    address: "",
    phone: ""
  });
  
  const [fontText, setFontText] = useState<string>("Arial");
  const [fontNumber, setFontNumber] = useState<string>("Arial");
  const [printStyle, setPrintStyle] = useState<string>("In chuyển nhiệt");
  const [printColor, setPrintColor] = useState<string>("Đen");
  
  const [designData, setDesignData] = useState<Partial<DesignData>>({
    uniform_type: 'player',
    font_text: {
      font: "Arial"
    },
    font_number: {
      font: "Arial"
    }
  });
  
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

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          const customerData: Customer = {
            ...data,
            created_at: parseDateSafely(data.created_at)
          };
          setCustomerInfo(customerData);
        }
      }
    };
    
    fetchCustomerInfo();
  }, [user]);
  
  const handleReferenceImagesUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList);
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    const filesToAdd = newFiles.slice(0, 5 - referenceImages.length);
    
    filesToAdd.forEach(file => {
      updatedFiles.push(file);
      updatedPreviews.push(URL.createObjectURL(file));
    });
    
    setReferenceImages(updatedFiles);
    setReferenceImagesPreview(updatedPreviews);
    
    if (filesToAdd.length < newFiles.length) {
      toast.warning("Chỉ có thể tải lên tối đa 5 hình ảnh tham khảo.");
    }
  };
  
  const removeReferenceImage = (index: number) => {
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setReferenceImages(updatedFiles);
    setReferenceImagesPreview(updatedPreviews);
  };
  
  useEffect(() => {
    return () => {
      referenceImagesPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return {
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    isGeneratingDesign,
    setIsGeneratingDesign,
    isDemoApproved,
    setIsDemoApproved,
    players,
    setPlayers,
    logos,
    setLogos,
    notes,
    setNotes,
    referenceImages,
    setReferenceImages,
    referenceImagesPreview,
    setReferenceImagesPreview,
    customerInfo,
    setCustomerInfo,
    fontText,
    setFontText,
    fontNumber,
    setFontNumber,
    printStyle,
    setPrintStyle,
    printColor,
    setPrintColor,
    designData,
    setDesignData,
    printConfig,
    setPrintConfig,
    productLines,
    setProductLines,
    handleReferenceImagesUpload,
    removeReferenceImage
  };
};
