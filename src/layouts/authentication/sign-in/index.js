import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // FIX: Added https://
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        alert("Login Failed");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox p={3} textAlign="center" variant="gradient" bgColor="info" borderRadius="lg" mt={-3} mx={2}>
          <MDTypography variant="h4" color="white">Sign In</MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3} component="form" onSubmit={handleLogin}>
          <MDBox mb={2}><MDInput type="email" label="Email" fullWidth onChange={(e)=>setEmail(e.target.value)} /></MDBox>
          <MDBox mb={2}><MDInput type="password" label="Password" fullWidth onChange={(e)=>setPassword(e.target.value)} /></MDBox>
          <MDBox mt={4} mb={1}><MDButton variant="gradient" color="info" fullWidth type="submit">Sign In</MDButton></MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}
export default SignIn;