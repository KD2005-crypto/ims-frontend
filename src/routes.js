import Dashboard from "layouts/dashboard";
import ManageGroups from "layouts/manage-groups";
import ManageChains from "layouts/manage-chains";
import ManageBrands from "layouts/manage-brands";
import ManageLocations from "layouts/manage-locations";
import GenerateInvoice from "layouts/generate-invoice";
import ManageAnalytics from "layouts/manage-analytics";
import ManageEstimates from "layouts/manage-estimates";
import ManageInvoices from "layouts/manage-invoices";
import Profile from "layouts/profile";

// Auth Pages
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// ✅ CHANGED THIS IMPORT (Points to the new "Basic" layout without sidebar)
import ResetPassword from "layouts/authentication/reset-password/basic";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Manage Groups",
    key: "manage-groups",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/manage-groups",
    component: <ManageGroups />,
    role: "admin", // 🔒 HIDDEN FROM STAFF
  },
  {
    type: "collapse",
    name: "Manage Chains",
    key: "manage-chains",
    icon: <Icon fontSize="small">link</Icon>,
    route: "/manage-chains",
    component: <ManageChains />,
    role: "admin", // 🔒 HIDDEN FROM STAFF
  },
  {
    type: "collapse",
    name: "Manage Brands",
    key: "manage-brands",
    icon: <Icon fontSize="small">branding_watermark</Icon>,
    route: "/manage-brands",
    component: <ManageBrands />,
    role: "admin", // 🔒 HIDDEN FROM STAFF
  },
  {
    type: "collapse",
    name: "Manage Locations",
    key: "manage-locations",
    icon: <Icon fontSize="small">place</Icon>,
    route: "/manage-locations",
    component: <ManageLocations />,
    role: "admin", // 🔒 HIDDEN FROM STAFF
  },
  {
    type: "divider",
    key: "divider-1",
  },
  {
    type: "collapse",
    name: "Manage Analytics",
    key: "manage-analytics",
    icon: <Icon fontSize="small">show_chart</Icon>,
    route: "/manage-analytics",
    component: <ManageAnalytics />,
    role: "admin",
  },
  {
    type: "collapse",
    name: "Manage Estimates",
    key: "manage-estimates",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/manage-estimates",
    component: <ManageEstimates />,
  },
  {
    type: "collapse",
    name: "Generate Invoice",
    key: "generate-invoice",
    icon: <Icon fontSize="small">receipt</Icon>,
    route: "/generate-invoice",
    component: <GenerateInvoice />,
  },
  {
    type: "collapse",
    name: "Manage Invoices",
    key: "manage-invoices",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/manage-invoices",
    component: <ManageInvoices />,
  },
  {
    type: "hidden",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "auth",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "auth",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  // ✅ RESET PASSWORD ROUTE (Uses type: "auth" to hide from sidebar)
  {
    type: "auth",
    name: "Reset Password",
    key: "reset-password",
    route: "/authentication/reset-password",
    component: <ResetPassword />,
  },
];

export default routes;