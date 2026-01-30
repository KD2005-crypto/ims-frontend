import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController, setLayout } from "context";

// SweetAlert
import Swal from "sweetalert2";

const API_URL = "https://ims-backend-production-e15c.up.railway.app/api";

function SignUp() {
  const [controller, dispatch] = useMaterialUIController();
  const navigate = useNavigate();

  // State for Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      Swal.fire("Missing Info", "Please fill in all fields", "warning");
      return;
    }

    if (!agree) {
      Swal.fire("Terms", "Please agree to the Terms and Conditions", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email: email, password: password }),
      });

      if (res.ok) {
        Swal.fire({
          title: "Registration Successful!",
          text: "You can now sign in.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate("/authentication/sign-in");
        });
      } else {
        const msg = await res.text();
        Swal.fire("Error", msg || "Registration failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server connection failed", "error");
    }
  };

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
            {/* ✅ FORMAL HEADER (Matches Login Style) */}
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
                User Registration
              </MDTypography>
              <MDTypography variant="caption" color="white" opacity={0.8} display="block" mb={1}>
                Enter your details to create an account
              </MDTypography>
            </MDBox>

            <MDBox pt={4} pb={3} px={3}>
              <MDBox component="form" role="form" onSubmit={handleRegister}>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Full Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="password"
                    label="Password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </MDBox>

                <MDBox display="flex" alignItems="center" ml={-1}>
                  <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <MDTypography
                    variant="button"
                    fontWeight="regular"
                    color="text"
                    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                    onClick={() => setAgree(!agree)}
                  >
                    &nbsp;&nbsp;I agree to the&nbsp;
                  </MDTypography>
                  <MDTypography
                    component="a"
                    href="#"
                    variant="button"
                    fontWeight="bold"
                    color="info"
                    textGradient
                  >
                    Terms and Conditions
                  </MDTypography>
                </MDBox>

                <MDBox mt={4} mb={1}>
                  <MDButton variant="gradient" color="info" fullWidth type="submit">
                    SIGN UP
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

export default SignUp;