import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email: email,
          password: password,
          // ✅ REMOVED: role: "ADMIN"
          // The backend will now automatically default new users to "STAFF"
        }),
      });

      if (response.ok) {
        alert("✅ Registration Successful! Please Login.");
        navigate("/authentication/sign-in");
      } else {
        const msg = await response.text();
        setError("Registration failed: " + msg);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
      <BasicLayout image={bgImage}>
        <Card>
          <MDBox
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="success"
              mx={2}
              mt={-3}
              p={3}
              mb={1}
              textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              User Registration
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              Enter your details to create an account
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form" onSubmit={handleRegister}>
              <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Full Name"
                    variant="standard"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                    type="email"
                    label="Email"
                    variant="standard"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                    type="password"
                    label="Password"
                    variant="standard"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
              </MDBox>

              {error && (
                  <MDTypography variant="caption" color="error" fontWeight="bold">
                    {error}
                  </MDTypography>
              )}

              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="info" fullWidth type="submit">
                  Sign Up
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Already have an account?{" "}
                  <MDTypography
                      component={Link}
                      to="/authentication/sign-in"
                      variant="button"
                      color="info"
                      fontWeight="medium"
                      textGradient
                  >
                    Sign In
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </BasicLayout>
  );
}

export default Cover;