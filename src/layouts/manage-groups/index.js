import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");

  // 1. Fetch Groups from Backend on Load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/groups");
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  // 2. Add New Group
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName: newGroupName }),
      });

      if (response.ok) {
        setNewGroupName(""); // Clear input
        setError(""); // Clear errors
        fetchGroups(); // Refresh list
      } else {
        const msg = await response.text();
        setError(msg);
      }
    } catch (err) {
      setError("Server Error");
    }
  };

  // 3. Delete Group
  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/groups/${id}`, { method: "DELETE" });
      fetchGroups();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Section 1: Add New Group Form */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Add New Client Group
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <MDInput
                      label="Enter Group Name (e.g., Persian Darbar)"
                      fullWidth
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={handleAddGroup}>
                      <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                      &nbsp;Add Group
                    </MDButton>
                  </Grid>
                </Grid>
                {error && (
                  <MDTypography variant="caption" color="error" mt={1}>
                    {error}
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Section 2: List of Groups */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
              >
                <MDTypography variant="h6" color="white">
                  Existing Groups
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {groups.map((group) => (
                  <MDBox
                    key={group.groupId}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    mb={1}
                    sx={{ borderBottom: "1px solid #f0f2f5" }}
                  >
                    <MDTypography variant="button" fontWeight="medium">
                      {group.groupId}. {group.groupName}
                    </MDTypography>
                    <MDButton
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteGroup(group.groupId)}
                    >
                      <Icon>delete</Icon>&nbsp;Delete
                    </MDButton>
                  </MDBox>
                ))}
                {groups.length === 0 && (
                  <MDTypography variant="caption" color="text">
                    No groups found. Add one above!
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ManageGroups;
