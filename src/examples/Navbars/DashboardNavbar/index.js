import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";

// SweetAlert for a clean logout confirmation
import Swal from "sweetalert2";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      const isTransparent = (fixedNavbar && window.scrollY === 0) || !fixedNavbar;
      if (isTransparent !== transparentNavbar) {
        setTransparentNavbar(dispatch, isTransparent);
      }
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar, transparentNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  // ✅ LOGOUT LOGIC: Clears everything and redirects
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You will need to sign in again to access your dashboard.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#344767",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); // Wipe token, role, and user data
        navigate("/authentication/sign-in"); // Send to login
      }
    });
  };

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"} display="flex" alignItems="center">

              {/* ✅ PROFILE BUTTON: Takes you to the attendance/leave page */}
              <Link to="/profile">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link>

              {/* ✅ LOGOUT BUTTON: Clean and functional */}
              <IconButton sx={navbarIconButton} size="small" disableRipple onClick={handleLogout}>
                <Icon sx={iconsStyle}>logout</Icon>
                <MDTypography variant="button" fontWeight="medium" color={light ? "white" : "dark"} ml={0.5}>
                  Logout
                </MDTypography>
              </IconButton>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = { absolute: false, light: false, isMini: false };
DashboardNavbar.propTypes = { absolute: PropTypes.bool, light: PropTypes.bool, isMini: PropTypes.bool };

export default DashboardNavbar;