import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context (To ensure layout is clean)
import { useMaterialUIController, setLayout } from "context";

// SweetAlert
import Swal from "sweetalert2";

const API_URL = "https://ims-backend-production-e15c.up.railway.app/api";

function Cover() {
  const [controller, dispatch] = useMaterialUIController();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Force Page Layout (Hides Navbar/Sidebar)
  useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire("Error", "Please enter your email", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      if (res.ok) {
        Swal.fire("Sent!", "Check your email for the reset link.", "success");
        setEmail("");
      } else {
        Swal.fire("Error", "Email not found", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Same Background as Login Page
  const bgImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

  return (
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
            {/* ✅ BLUE HEADER (Exact match to Sign In page) */}
            <MDBox
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              mx={2}
              mt={-3}
              p={2}
              mb={1}
              textAlign="center"
            >
              <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                Reset Password
              </MDTypography>
              <MDTypography display="block" variant="button" color="white" my={1}>
                Enter your email to receive a reset link
              </MDTypography>
            </MDBox>

            <MDBox pt={4} pb={3} px={3}>
              <MDBox component="form" role="form" onSubmit={handleReset}>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </MDBox>

                <MDBox mt={4} mb={1}>
                  <MDButton variant="gradient" color="info" fullWidth type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </MDButton>
                </MDBox>

                <MDBox mt={3} mb={1} textAlign="center">
                  <MDTypography variant="button" color="text">
                    Remembered it?{" "}
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

          {/* Footer Copyright */}
          <MDBox mt={2} textAlign="center">
            <MDTypography variant="caption" color="white" opacity={0.8}>
              © 2026 Code-B Enterprise System. Dhanshri K.
            </MDTypography>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Cover;