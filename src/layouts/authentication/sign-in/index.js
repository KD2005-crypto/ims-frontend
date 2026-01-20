import { useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // NEW Professional Abstract Tech Background
  const bgImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

  return (
    // Custom Full-Screen Container to remove the default Navbar
    <MDBox
      width="100vw"
      height="100vh"
      sx={{
        backgroundImage: `linear-gradient(195deg, rgba(66, 66, 74, 0.6), rgba(25, 25, 35, 0.8)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
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

          {/* Footer Text placed outside the card, against the background */}
          <MDBox mt={2} textAlign="center">
            <MDTypography variant="caption" color="white" opacity={0.8}>
              © 2026 Code-B Enterprise System. Secure Access.
            </MDTypography>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Basic;