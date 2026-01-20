import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const { pathname } = useLocation();

  // Check if user is logged in [NEW AUTH LOGIC]
  const isAuthenticated = localStorage.getItem("user");

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);
      if (route.route) return <Route exact path={route.route} element={route.component} key={route.key} />;
      return null;
    });

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && isAuthenticated && ( // Sidenav only shows if logged in
        <Sidenav
          color={sidenavColor}
          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
          brandName="Code-B IMS"
          routes={routes.filter(r => r.type !== "auth")} // Hide Sign-in from sidebar
        />
      )};
      <Routes>
        {getRoutes(routes)}
        {/* If user is logged in, go to Dashboard. If NOT, force them to Sign In */}
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}