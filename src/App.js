import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setLayout } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

// --- IMPORT THE GUARD ---
import ProtectedRoute from "ProtectedRoute";

export default function App() {
    const [controller, dispatch] = useMaterialUIController();
    const { miniSidenav, layout, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
    const { pathname } = useLocation();

    const isAuthenticated = localStorage.getItem("user");

    useEffect(() => {
        if (isAuthenticated) {
            setLayout(dispatch, "dashboard");
        }
    }, [isAuthenticated, dispatch]);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;
    }, [pathname]);

    const getRoutes = (allRoutes) =>
        allRoutes.map((route) => {
            if (route.collapse) {
                return getRoutes(route.collapse);
            }

            if (route.route) {
                // --- SECURITY LOGIC ---
                // If the route is an "auth" page (Sign In), let it pass freely.
                // If it is anything else (Dashboard, Invoices), WRAP IT in ProtectedRoute.
                if (route.type === "auth") {
                    return <Route exact path={route.route} element={route.component} key={route.key} />;
                } else {
                    return (
                        <Route
                            exact
                            path={route.route}
                            element={
                                <ProtectedRoute>
                                    {route.component}
                                </ProtectedRoute>
                            }
                            key={route.key}
                        />
                    );
                }
            }
            return null;
        });

    return (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
            <CssBaseline />

            {layout === "dashboard" && isAuthenticated && (
                <Sidenav
                    color={sidenavColor}
                    brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                    brandName="Code-B IMS"
                    routes={routes.filter((r) => r.type !== "auth")}
                />
            )}

            <Routes>
                {getRoutes(routes)}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </ThemeProvider>
    );
}