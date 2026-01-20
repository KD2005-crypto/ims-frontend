import Dashboard from "layouts/dashboard";
import ManageGroups from "layouts/manage-groups";
import ManageChains from "layouts/manage-chains";
import ManageBrands from "layouts/manage-brands";
import ManageLocations from "layouts/manage-locations";
import GenerateInvoice from "layouts/generate-invoice";
import ManageProjects from "layouts/manage-projects";
import ManageAnalytics from "layouts/manage-analytics";
import SignIn from "layouts/authentication/sign-in"; // Added this import

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
  },
  {
    type: "collapse",
    name: "Manage Chains",
    key: "manage-chains",
    icon: <Icon fontSize="small">link</Icon>,
    route: "/manage-chains",
    component: <ManageChains />,
  },
  {
    type: "collapse",
    name: "Manage Brands",
    key: "manage-brands",
    icon: <Icon fontSize="small">branding_watermark</Icon>,
    route: "/manage-brands",
    component: <ManageBrands />,
  },
  {
    type: "collapse",
    name: "Manage Locations",
    key: "manage-locations",
    icon: <Icon fontSize="small">place</Icon>,
    route: "/manage-locations",
    component: <ManageLocations />,
  },
  {
    type: "divider",
    key: "divider-1",
  },
  {
    type: "collapse",
    name: "Manage Projects",
    key: "manage-projects",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/manage-projects",
    component: <ManageProjects />,
  },
  {
    type: "collapse",
    name: "Manage Analytics",
    key: "manage-analytics",
    icon: <Icon fontSize="small">show_chart</Icon>,
    route: "/manage-analytics",
    component: <ManageAnalytics />,
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
    type: "auth", // This allows the route to exist without appearing in Sidenav
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;