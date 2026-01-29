import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

// Context
import { useMaterialUIController, setLayout } from "context";

function BasicReset() {
    const [, dispatch] = useMaterialUIController();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isResetMode, setIsResetMode] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // ☢️ THE FIX: FORCE HIDE SIDEBAR & NAVBAR
    // We use a timeout to ensure this runs AFTER the App tries to show them.
    useEffect(() => {
        const timer = setTimeout(() => {
            setLayout(dispatch, "authentication");
        }, 100); // 100ms delay to override App.js
        return () => clearTimeout(timer);
    }, [dispatch]);

    // --- LOGIC ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get("email");
        if (emailParam) {
            setEmail(emailParam);
            setIsResetMode(true);
        }
    }, [location]);

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

    return (
        <BasicLayout image={bgImage}>
            {/* ☢️ CSS KILL SWITCH: This guarantees elements are hidden */}
            <style>{`
        aside { display: none !important; } /* Hides Sidebar */
        nav.MuiAppBar-root { display: none !important; } /* Hides Top Navbar */
      `}</style>

            <Card>
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
                        {isResetMode ? "Set New Password" : "Reset Password"}
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
                                disabled={isResetMode}
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
                    </MDBox>
                </MDBox>
            </Card>
        </BasicLayout>
    );
}

export default BasicReset;