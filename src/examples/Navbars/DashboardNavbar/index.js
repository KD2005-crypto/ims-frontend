/**
 =========================================================
 * Material Dashboard 2 React - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

import { useState, useEffect } from "react";

// react-router-dom components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// Images
import team4 from "assets/images/team-4.jpg"; // Admin Avatar

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  // --- STATE FOR MENUS ---
  const [openMenu, setOpenMenu] = useState(false); // Notifications
  const [openProfile, setOpenProfile] = useState(false); // Profile
  const [openSettings, setOpenSettings] = useState(false); // Settings

  const [invoices, setInvoices] = useState([]); // For Payment Notifications

  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    // Fetch Invoices for Notifications
    fetch("ims-backend-production-e15c.up.railway.app/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data.slice(0, 5))) // Get top 5 recent
      .catch((err) => console.log(err));

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  // --- HANDLERS ---
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleOpenProfile = (event) => setOpenProfile(event.currentTarget);
  const handleCloseProfile = () => setOpenProfile(false);

  const handleOpenSettings = (event) => setOpenSettings(event.currentTarget);
  const handleCloseSettings = () => setOpenSettings(false);

  const handleLogout = () => {
    // Logic to clear token if you had one
    alert("Logged out successfully");
    navigate("/authentication/sign-in");
  };

  // --- RENDER NOTIFICATION MENU (PAYMENTS) ---
  const renderNotificationMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <MDBox px={2} py={1}>
        <MDTypography variant="h6" color="dark">
          Payment History
        </MDTypography>
        <MDTypography variant="caption" color="text">
          Recent successful transactions
        </MDTypography>
      </MDBox>
      <Divider />

      {invoices.length > 0 ? (
        invoices.map((inv) => (
          <NotificationItem
            key={inv.invoiceId}
            icon={<Icon>credit_card</Icon>}
            title={`Received ₹${inv.totalAmount}`}
            date={`${inv.customerName} - ${inv.invoiceNumber}`}
            onClick={handleCloseMenu}
          />
        ))
      ) : (
        <MDBox p={2}>
          <MDTypography variant="caption">No recent payments.</MDTypography>
        </MDBox>
      )}
    </Menu>
  );

  // --- RENDER PROFILE MENU ---
  const renderProfileMenu = () => (
    <Menu
      anchorEl={openProfile}
      open={Boolean(openProfile)}
      onClose={handleCloseProfile}
      sx={{ mt: 2 }}
    >
      <MDBox px={3} py={2} textAlign="center">
        <MDAvatar src={team4} size="lg" shadow="md" />
        <MDBox mt={2}>
          <MDTypography variant="h6">Admin User</MDTypography>
          <MDTypography variant="caption" color="text">
            Super Administrator
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MenuItem onClick={handleCloseProfile}>
        <Icon sx={{ mr: 1 }}>person</Icon> My Profile
      </MenuItem>
      <MenuItem onClick={handleCloseProfile}>
        <Icon sx={{ mr: 1 }}>list</Icon> Activity Log
      </MenuItem>
    </Menu>
  );

  // --- RENDER SETTINGS MENU ---
  const renderSettingsMenu = () => (
    <Menu
      anchorEl={openSettings}
      open={Boolean(openSettings)}
      onClose={handleCloseSettings}
      sx={{ mt: 2 }}
    >
      <MenuItem onClick={handleCloseSettings}>
        <Icon sx={{ mr: 1 }}>settings</Icon> Account Settings
      </MenuItem>
      <MenuItem onClick={handleCloseSettings}>
        <Icon sx={{ mr: 1 }}>vpn_key</Icon> Change Password
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
        <Icon sx={{ mr: 1 }}>logout</Icon> Logout
      </MenuItem>
    </Menu>
  );

  // Styles for the navbar icons
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
            <MDBox pr={1}>
              <MDInput label="Search here..." />
            </MDBox>
            <MDBox color={light ? "white" : "inherit"}>
              {/* 1. PROFILE ICON */}
              <IconButton
                sx={navbarIconButton}
                size="small"
                disableRipple
                onClick={handleOpenProfile}
              >
                <Icon sx={iconsStyle}>account_circle</Icon>
              </IconButton>
              {renderProfileMenu()}

              {/* 2. SETTINGS ICON (Replaces Configurator) */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleOpenSettings} // CHANGED to open our menu
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              {renderSettingsMenu()}

              {/* 3. NOTIFICATIONS ICON */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderNotificationMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
