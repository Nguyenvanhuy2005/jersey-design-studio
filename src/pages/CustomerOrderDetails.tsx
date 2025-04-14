
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { CustomerOrderDetails } from "@/components/customer/customer-order-details";
import { LoaderCircle } from "lucide-react";

const CustomerOrderDetailsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/customer/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return null; // Will redirect due to the useEffect
  }
  
  return (
    <Layout>
      <CustomerOrderDetails />
    </Layout>
  );
};

export default CustomerOrderDetailsPage;
