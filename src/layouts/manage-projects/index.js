import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip"; // For displaying selected members
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDProgress from "components/MDProgress";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [allMembers, setAllMembers] = useState([]);

  // Form State
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [completion, setCompletion] = useState(0);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]); // Array of IDs
  const [editingId, setEditingId] = useState(null); // If not null, we are editing

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("https://ims-backend-production-e15c.up.railway.app/api/projects");
    setProjects(await res.json());
  };

  const fetchMembers = async () => {
    const res = await fetch("https://ims-backend-production-e15c.up.railway.app/api/members");
    setAllMembers(await res.json());
  };

  const handleSubmit = async () => {
    const payload = {
      name,
      budget,
      completion: parseInt(completion),
      memberIds: selectedMemberIds,
    };

    const url = editingId
      ? `https://ims-backend-production-e15c.up.railway.app/api/projects/${editingId}`
      : "https://ims-backend-production-e15c.up.railway.app/api/projects";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Reset Form
    setName("");
    setBudget("");
    setCompletion(0);
    setSelectedMemberIds([]);
    setEditingId(null);
    fetchProjects(); // Refresh list
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setName(project.name);
    setBudget(project.budget);
    setCompletion(project.completion);
    // Extract IDs from project objects
    setSelectedMemberIds(project.members.map((m) => m.id));
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      await fetch(`https://ims-backend-production-e15c.up.railway.app/api/projects/${id}`, { method: "DELETE" });
      fetchProjects();
    }
  };

  const handleMemberChange = (event) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    setSelectedMemberIds(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* FORM SECTION */}
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
                  {editingId ? "Edit Project" : "Create New Project"}
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Project Name"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Budget (e.g. $5000)"
                      fullWidth
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      type="number"
                      label="Progress %"
                      fullWidth
                      value={completion}
                      onChange={(e) => setCompletion(e.target.value)}
                    />
                  </Grid>

                  {/* MULTI-SELECT MEMBERS */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="members-label">Assign Team Members</InputLabel>
                      <Select
                        labelId="members-label"
                        multiple
                        value={selectedMemberIds}
                        onChange={handleMemberChange}
                        input={<OutlinedInput label="Assign Team Members" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selected.map((value) => {
                              const member = allMembers.find((m) => m.id === value);
                              return <Chip key={value} label={member ? member.name : value} />;
                            })}
                          </Box>
                        )}
                        sx={{ height: "50px" }}
                      >
                        {allMembers.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            {member.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <MDButton
                      variant="gradient"
                      color={editingId ? "warning" : "success"}
                      fullWidth
                      onClick={handleSubmit}
                    >
                      {editingId ? "Update Project" : "Create Project"}
                    </MDButton>
                    {editingId && (
                      <MDButton
                        variant="text"
                        color="error"
                        fullWidth
                        onClick={() => {
                          setEditingId(null);
                          setName("");
                          setSelectedMemberIds([]);
                        }}
                      >
                        Cancel Edit
                      </MDButton>
                    )}
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* LIST SECTION */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Active Projects</MDTypography>
                <MDBox mt={2}>
                  {projects.map((proj) => (
                    <MDBox
                      key={proj.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{ borderBottom: "1px solid #eee" }}
                    >
                      <MDBox width="40%">
                        <MDTypography variant="button" fontWeight="bold">
                          {proj.name}
                        </MDTypography>
                        <MDTypography variant="caption" display="block" color="text">
                          Budget: {proj.budget}
                        </MDTypography>
                      </MDBox>

                      <MDBox width="30%">
                        <MDTypography variant="caption" fontWeight="medium">
                          Team:
                        </MDTypography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {proj.members.map((m) => (
                            <Chip key={m.id} label={m.name} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </MDBox>

                      <MDBox width="20%">
                        <MDTypography variant="caption">Progress: {proj.completion}%</MDTypography>
                        <MDProgress value={proj.completion} color="info" variant="gradient" />
                      </MDBox>

                      <MDBox width="10%" textAlign="right">
                        <Icon
                          color="warning"
                          sx={{ cursor: "pointer", marginRight: 1 }}
                          onClick={() => handleEdit(proj)}
                        >
                          edit
                        </Icon>
                        <Icon
                          color="error"
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleDelete(proj.id)}
                        >
                          delete
                        </Icon>
                      </MDBox>
                    </MDBox>
                  ))}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ManageProjects;
