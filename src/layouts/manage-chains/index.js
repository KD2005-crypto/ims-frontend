import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageChains() {
  // State variables
  const [chains, setChains] = useState([]);
  const [groups, setGroups] = useState([]);

  // Form inputs
  const [chainName, setChainName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [error, setError] = useState("");

  // 1. Load Data on Page Start
  useEffect(() => {
    fetchGroups();
    fetchChains();
  }, []);

  // --- API FUNCTIONS ---

  const fetchGroups = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/groups");
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchChains = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/chains");
      const data = await response.json();
      setChains(data);
    } catch (err) {
      console.error("Error fetching chains:", err);
    }
  };

  const handleAddChain = async () => {
    // --- VALIDATION START ---

    // 1. Check for empty fields
    if (!chainName || !selectedGroupId || !gstNumber) {
      setError("Please fill in all fields.");
      return;
    }

    // 2. Check GST Length (Must be 15 characters)
    if (gstNumber.length < 15) {
      setError("Invalid GST Number. It must be at least 15 characters.");
      return;
    }

    // --- VALIDATION END ---

    const payload = {
      chainName: chainName,
      gstNumber: gstNumber,
      // FIXED: Changed "group_id" to "groupId" to match Backend Requirement
      groupId: selectedGroupId,
    };

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setChainName("");
        setGstNumber("");
        setSelectedGroupId("");
        setError("");
        fetchChains(); // Refresh list
      } else {
        setError("Failed to add chain. (Backend rejected data)");
      }
    } catch (err) {
      setError("Server Error.");
    }
  };

  const handleDeleteChain = async (id) => {
    if (window.confirm("Are you sure you want to delete this chain?")) {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/chains/${id}`, { method: "DELETE" });
      fetchChains();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Section 1: Add Chain Form */}
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
                  Add New Chain / Company
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  {/* Dropdown to Select Group */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="group-select-label">Select Client Group</InputLabel>
                      <Select
                        labelId="group-select-label"
                        value={selectedGroupId}
                        label="Select Client Group"
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {groups.map((group) => (
                          <MenuItem key={group.groupId} value={group.groupId}>
                            {group.groupName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Chain Name Input */}
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Chain Name (e.g. Mumbai Pvt Ltd)"
                      fullWidth
                      value={chainName}
                      onChange={(e) => setChainName(e.target.value)}
                    />
                  </Grid>

                  {/* GST Number Input */}
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="GST Number"
                      fullWidth
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                    />
                  </Grid>

                  {/* Add Button */}
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={handleAddChain}>
                      Add Chain
                    </MDButton>
                  </Grid>
                </Grid>

                {error && (
                  <MDTypography variant="caption" color="error" mt={2} display="block">
                    {error}
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Section 2: List of Chains */}
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
                  Existing Chains
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={2}>
                {chains.map((chain) => (
                  <MDBox
                    key={chain.chainId}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    mb={1}
                    sx={{ borderBottom: "1px solid #f0f2f5" }}
                  >
                    <MDBox>
                      <MDTypography variant="button" fontWeight="medium" display="block">
                        {chain.chainName}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        Group: {chain.clientGroup ? chain.clientGroup.groupName : "No Group"} | GST: {chain.gstNumber}
                      </MDTypography>
                    </MDBox>
                    <MDButton
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteChain(chain.chainId)}
                    >
                      <Icon>delete</Icon>&nbsp;Delete
                    </MDButton>
                  </MDBox>
                ))}

                {chains.length === 0 && (
                  <MDTypography variant="caption" color="text" p={2}>
                    No chains found.
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

export default ManageChains;