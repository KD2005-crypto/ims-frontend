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

function ManageBrands() {
  // State variables
  const [brands, setBrands] = useState([]);
  const [chains, setChains] = useState([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Form inputs
  const [brandName, setBrandName] = useState("");
  const [selectedChainId, setSelectedChainId] = useState("");
  const [error, setError] = useState("");

  // 1. Load Data on Page Start
  useEffect(() => {
    fetchChains();
    fetchBrands();
  }, []);

  // --- API FUNCTIONS ---

  const fetchChains = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/chains");
      const data = await response.json();
      setChains(data);
    } catch (err) {
      console.error("Error fetching chains:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/brands");
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const handleAddBrand = async () => {
    if (!brandName || !selectedChainId) {
      setError("Please fill in all fields (Chain and Brand Name).");
      return;
    }

    const payload = {
      brandName: brandName,
      // FIXED: Changed "chain_id" to "chainId" to match Backend Requirement
      chainId: selectedChainId,
    };

    try {
      const response = await fetch("https://ims-backend-production-e15c.up.railway.app/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setBrandName("");
        setSelectedChainId("");
        setError("");
        fetchBrands(); // Refresh list immediately
      } else {
        setError("Failed to add brand. (Backend rejected data)");
      }
    } catch (err) {
      setError("Server Error.");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/brands/${id}`, { method: "DELETE" });
      fetchBrands();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Section 1: Add Brand Form */}
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
                  Add New Brand
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  {/* Dropdown to Select Chain */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="chain-select-label">Select Chain / Company</InputLabel>
                      <Select
                        labelId="chain-select-label"
                        value={selectedChainId}
                        label="Select Chain / Company"
                        onChange={(e) => setSelectedChainId(e.target.value)}
                        sx={{ height: "45px" }}
                      >
                        {chains.map((chain) => (
                          <MenuItem key={chain.chainId} value={chain.chainId}>
                            {chain.chainName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Brand Name Input */}
                  <Grid item xs={12} md={5}>
                    <MDInput
                      label="Brand Name (e.g. Edgeverge Systems)"
                      fullWidth
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </Grid>

                  {/* Add Button */}
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={handleAddBrand}>
                      Add Brand
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

          {/* Section 2: List of Brands */}
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
                  Existing Brands
                </MDTypography>
              </MDBox>

              {/* --- SEARCH BAR SECTION --- */}
              <MDBox p={2}>
                <MDInput
                  label="Search Brands or Chains..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </MDBox>

              <MDBox pt={1} px={3} pb={2}>
                {brands
                  .filter((brand) => {
                    if (searchTerm === "") return true;
                    // Helper to safely check name
                    const bName = brand.brandName ? brand.brandName.toLowerCase() : "";
                    const cName = brand.chain && brand.chain.chainName ? brand.chain.chainName.toLowerCase() : "";
                    return bName.includes(searchTerm.toLowerCase()) || cName.includes(searchTerm.toLowerCase());
                  })
                  .map((brand) => (
                    <MDBox
                      key={brand.brandId}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      mb={1}
                      sx={{ borderBottom: "1px solid #f0f2f5" }}
                    >
                      <MDBox>
                        <MDTypography variant="button" fontWeight="medium" display="block">
                          {brand.brandName}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Linked Chain: {brand.chain ? brand.chain.chainName : "Unknown"}
                        </MDTypography>
                      </MDBox>
                      <MDButton
                        variant="text"
                        color="error"
                        onClick={() => handleDeleteBrand(brand.brandId)}
                      >
                        <Icon>delete</Icon>&nbsp;Delete
                      </MDButton>
                    </MDBox>
                  ))}

                {brands.length === 0 && (
                  <MDTypography variant="caption" color="text" p={2}>
                    No brands found.
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

export default ManageBrands;