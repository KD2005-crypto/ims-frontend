import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController, setLayout } from "context";

function BasicReset() {
    const [, dispatch] = useMaterialUIController();
    const location = useLocation();
    const navigate = useNavigate();

    // --- STATE & LOGIC (Preserved exactly as you had it) ---
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isResetMode, setIsResetMode] = useState(false);

    // 1. Force Full Page Layout
    useEffect(() => {
        setLayout(dispatch, "page");
    }, [dispatch]);

    // 2. Check for Token/Email in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get("email");
        if (emailParam) {
            setEmail(emailParam);
            setIsResetMode(true);
        }
    }, [location]);

    // 3. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("Processing...");

        const endpoint = isResetMode
          ? "https://ims-backend-production-e15c.up.railway.app/api/auth/reset-password"
          : "https://ims-backend-production-e15c.up.railway.app/api/auth/forgot-password";

        const body = isResetMode
          ? { email, password: newPassword }
          : { email };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const text = await response.text();
            setMessage(text);

            if (response.ok && isResetMode) {
                setTimeout(() => navigate("/authentication/sign-in"), 3000);
            }
        } catch (err) {
            setMessage("❌ Server Error. Please try again.");
        }
    };

    // Shared Background Image (Matches Login Page)
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
                      {/* ✅ BLUE HEADER (Exact match to Login) */}
                      <MDBox
                        variant="gradient"
                        bgColor="info"
                        borderRadius="lg"
                        coloredShadow="info"
                        mx={2}
                        mt={-3}
                        p={3}
                        mb={1}
                        textAlign="center"
                      >
                          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                              {isResetMode ? "Set New Password" : "Reset Password"}
                          </MDTypography>
                          <MDTypography variant="caption" color="white" opacity={0.8} display="block" mb={1}>
                              {isResetMode ? "Enter your new credentials" : "Enter your email to receive a link"}
                          </MDTypography>
                      </MDBox>

                      <MDBox pt={4} pb={3} px={3}>
                          <MDBox component="form" role="form" onSubmit={handleSubmit}>
                              <MDBox mb={2}>
                                  <MDInput
                                    type="email"
                                    label="Email"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isResetMode} // Locked if resetting
                                    required
                                  />
                              </MDBox>

                              {isResetMode && (
                                <MDBox mb={2}>
                                    <MDInput
                                      type="password"
                                      label="New Password"
                                      fullWidth
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      required
                                    />
                                </MDBox>
                              )}

                              {message && (
                                <MDBox mb={2} textAlign="center">
                                    <MDTypography variant="caption" color="info" fontWeight="bold">
                                        {message}
                                    </MDTypography>
                                </MDBox>
                              )}

                              <MDBox mt={4} mb={1}>
                                  <MDButton variant="gradient" color="info" fullWidth type="submit">
                                      {isResetMode ? "Update Password" : "Send Reset Link"}
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

export default BasicReset;