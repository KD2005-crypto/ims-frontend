import { useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons (Removed Social Icons for Professional Look)

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // A Professional "Tech/Network" Background Image
  const bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

  return (
    <BasicLayout image={bgImage}>
      <Card>
        {/* --- 1. HEADER SECTION --- */}
        <MDBox
          variant="gradient"
          bgColor="info" // Uses your theme's Blue
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Code-B IMS
          </MDTypography>
          <MDTypography variant="caption" color="white" opacity={0.8} display="block" mb={1}>
            Authorized Personnel Only
          </MDTypography>
        </MDBox>

        {/* --- 2. FORM SECTION --- */}
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput type="email" label="Corporate ID / Email" fullWidth />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password" fullWidth />
            </MDBox>

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Keep me logged in
              </MDTypography>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                component={Link}
                to="/dashboard" // Temporary link to skip login for demo
              >
                Secure Login
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="caption" color="text">
                Forgot your credentials?{" "}
                <MDTypography
                  component={Link}
                  to="#"
                  variant="caption"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Contact IT Support
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* Footer Text */}
      <MDBox mt={2} textAlign="center">
        <MDTypography variant="caption" color="white">
          © 2026 Code-B Enterprise System. Secure Access.
        </MDTypography>
      </MDBox>

    </BasicLayout>
  );
}

export default Basic;