
import { useState, useEffect } from "react";
import { Player, Logo, PrintConfig, ProductLine, DesignData, Customer, DeliveryInformation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseDateSafely } from "@/utils/format-utils";
import { toast } from "sonner";

export const useOrderForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState<boolean>(false);
  const [isDemoApproved, setIsDemoApproved] = useState<boolean>(false);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagesPreview, setReferenceImagesPreview] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    id: '',
    name: "",
    address: "",
    phone: ""
  });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInformation>({
    recipient_name: "",
    address: "",
    phone: "",
    delivery_note: ""
  });
  
  const [fontText, setFontText] = useState<string>("Arial");
  const [fontNumber, setFontNumber] = useState<string>("Arial");
  const [printStyle, setPrintStyle] = useState<string>("In chuyển nhiệt");
  const [printColor, setPrintColor] = useState<string>("Đen");
  
  const [designData, setDesignData] = useState<Partial<DesignData>>({
    uniform_type: 'player',
    font_text: {
      font: fontText
    },
    font_number: {
      font: fontNumber
    }
  });
  
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    font: "Arial",
    backMaterial: "In chuyển nhiệt",
    frontMaterial: "In chuyển nhiệt",
    sleeveMaterial: "In chuyển nhiệt",
    legMaterial: "In chuyển nhiệt"
  });
  
  const [productLines, setProductLines] = useState<ProductLine[]>([]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!user) {
        setCustomerInfo({
          id: '',
          name: "",
          address: "",
          phone: ""
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching customer info:", error);
          if (error.code !== 'PGRST116') { // Not found error
            toast.error("Không thể tải thông tin khách hàng");
          }
          return;
        }
        
        if (data) {
          const customerData: Customer = {
            ...data,
            // Fix this line: parse the created_at as a string instead of a Date
            created_at: data.created_at ? data.created_at : undefined
          };
          setCustomerInfo(customerData);
          
          // Pre-fill delivery info with customer info for convenience
          setDeliveryInfo({
            recipient_name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            delivery_note: data.delivery_note || ""
          });
        }
      } catch (error) {
        console.error("Error in fetchCustomerInfo:", error);
        toast.error("Có lỗi khi tải thông tin khách hàng");
      }
    };
    
    fetchCustomerInfo();
  }, [user]);
  
  useEffect(() => {
    console.log("[useOrderForm] players:", players);
    console.log("[useOrderForm] productLines:", productLines);
  }, [players, productLines]);
  
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

  const updateFontText = (newFont: string) => {
    console.log('Updating font text to:', newFont);
    setFontText(newFont);
    setDesignData(prev => {
      const updated = {
        ...prev,
        font_text: {
          ...prev.font_text,
          font: newFont
        }
      };
      console.log('Updated design data with new text font:', updated);
      return updated;
    });
  };

  const updateFontNumber = (newFont: string) => {
    console.log('Updating font number to:', newFont);
    setFontNumber(newFont);
    setDesignData(prev => {
      const updated = {
        ...prev,
        font_number: {
          ...prev.font_number,
          font: newFont
        }
      };
      console.log('Updated design data with new number font:', updated);
      return updated;
    });
  };

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
    deliveryInfo,
    setDeliveryInfo,
    fontText,
    setFontText: updateFontText,
    fontNumber,
    setFontNumber: updateFontNumber,
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
