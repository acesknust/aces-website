import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token");
          console.log(token);
          
          if (token) {
            setIsAuthenticated(true);
            console.log("authenticated");
            
          } else {
            setIsAuthenticated(false);
            console.log("not authenticated");
          }
        }
      } catch (error) {
        // Handle errors, e.g., network error
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
        redirect("/login");
      }
    };

    // Call the checkAuth function on initial component mount
    checkAuth();
}, []);

console.log("tyuyuiuiui", isAuthenticated);
return isAuthenticated;
};

export default useAuth;
