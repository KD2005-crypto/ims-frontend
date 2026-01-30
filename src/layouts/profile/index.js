import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// SweetAlert
import Swal from "sweetalert2";

const API_URL = "https://ims-backend-production-e15c.up.railway.app/api";

const ModernCard = ({ children, title, icon, color = "info" }) => (
  <Card sx={{ height: "100%", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: "16px", border: "1px solid #f0f2f5" }}>
      <MDBox p={3}>
          <MDBox display="flex" alignItems="center" mb={3}>
              <MDBox
                display="flex" justifyContent="center" alignItems="center"
                width="40px" height="40px" bgColor={color} variant="gradient"
                color="white" borderRadius="lg" shadow="md" mr={2}
              >
                  <Icon fontSize="small">{icon}</Icon>
              </MDBox>
              <MDTypography variant="h6" fontWeight="bold">{title}</MDTypography>
          </MDBox>
          {children}
      </MDBox>
  </Card>
);

// ==============================
// 1. ADMIN DASHBOARD
// ==============================
const AdminDashboard = ({ activeTab }) => {
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    const fetchAdminData = async () => {
        const token = localStorage.getItem("token");
        try {
            const attRes = await fetch(`${API_URL}/attendance/today`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (attRes.ok) setEmployeeAttendance(await attRes.json());

            const leaveRes = await fetch(`${API_URL}/leaves/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (leaveRes.ok) setLeaveRequests(await leaveRes.json());
        } catch (error) { console.error("Admin Sync Error"); }
    };

    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLeaveAction = async (id, status) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/leaves/${id}/status?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Swal.fire({ title: "Updated", icon: "success", timer: 1000, showConfirmButton: false });
                fetchAdminData();
            }
        } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ModernCard title="Today's Attendance Log" icon="groups" color="info">
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ display: "table-header-group" }}>
                                    <TableRow>
                                        <TableCell>Employee</TableCell>
                                        <TableCell align="center">Check In</TableCell>
                                        <TableCell align="center">Check Out</TableCell>
                                        <TableCell align="center">Work Hours</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employeeAttendance.length === 0 && (
                                      <TableRow><TableCell colSpan={5} align="center">No records today.</TableCell></TableRow>
                                    )}
                                    {employeeAttendance.map((emp, i) => (
                                      <TableRow key={i}>
                                          <TableCell>
                                              <MDBox display="flex" alignItems="center">
                                                  <Avatar sx={{ bgcolor: "#344767", mr: 2 }}>{emp.email[0].toUpperCase()}</Avatar>
                                                  <MDTypography variant="button" fontWeight="bold">{emp.email}</MDTypography>
                                              </MDBox>
                                          </TableCell>
                                          <TableCell align="center"><MDTypography variant="caption" fontWeight="bold">{emp.checkInTime}</MDTypography></TableCell>
                                          <TableCell align="center"><MDTypography variant="caption" fontWeight="bold">{emp.checkOutTime || "-"}</MDTypography></TableCell>
                                          <TableCell align="center"><MDTypography variant="caption" color="info" fontWeight="bold">{emp.workHours || "-"}</MDTypography></TableCell>
                                          <TableCell align="center">
                                              <Chip
                                                label={emp.status}
                                                color={emp.status === 'COMPLETED' ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ color: "white", fontWeight: "bold" }}
                                              />
                                          </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </ModernCard>
                </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ModernCard title="Pending Approvals" icon="fact_check" color="warning">
                        {leaveRequests.length === 0 ? <MDTypography variant="button" color="text">All requests processed!</MDTypography> : (
                          <Grid container spacing={2}>
                              {leaveRequests.map((req) => (
                                <Grid item xs={12} key={req.id}>
                                    <MDBox p={2} sx={{ bgcolor: "#fbfcfd", borderRadius: "12px", border: "1px solid #f0f2f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <MDBox>
                                            <MDTypography variant="button" fontWeight="bold" display="block">{req.email}</MDTypography>
                                            <MDTypography variant="caption" color="text">{req.reason}</MDTypography>
                                        </MDBox>
                                        <MDBox display="flex" gap={1}>
                                            <MDButton variant="gradient" color="success" size="small" onClick={() => handleLeaveAction(req.id, 'approve')}>Approve</MDButton>
                                            <MDButton variant="outlined" color="error" size="small" onClick={() => handleLeaveAction(req.id, 'reject')}>Reject</MDButton>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                              ))}
                          </Grid>
                        )}
                    </ModernCard>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};

// ==============================
// 2. STAFF DASHBOARD
// ==============================
const StaffDashboard = ({ activeTab, user }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [leaveDate, setLeaveDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [myLeaveHistory, setMyLeaveHistory] = useState([]);

    const syncStaffData = async () => {
        const token = localStorage.getItem("token");
        try {
            const attRes = await fetch(`${API_URL}/attendance/${user.email}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (attRes.ok) {
                const history = await attRes.json();
                const today = new Date().toLocaleDateString('en-CA');
                const todayRecord = history.find(r => r.date === today); // Matches your Service IST date

                if (todayRecord) {
                    setCheckInTime(todayRecord.checkInTime);
                    if (todayRecord.checkOutTime) {
                        setIsCompleted(true);
                        setIsCheckedIn(false);
                        setCheckOutTime(todayRecord.checkOutTime);
                    } else {
                        setIsCheckedIn(true);
                        setIsCompleted(false);
                    }
                } else {
                    setIsCheckedIn(false);
                    setIsCompleted(false);
                }
            }
            const leaveRes = await fetch(`${API_URL}/leaves/user/${user.email}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (leaveRes.ok) setMyLeaveHistory(await leaveRes.json());
        } catch (e) { console.error("Staff Sync Error"); }
    };

    useEffect(() => { syncStaffData(); }, [user.email]);

    const handleAttendance = async () => {
        const token = localStorage.getItem("token");
        const endpoint = isCheckedIn ? "check-out" : "check-in";
        const method = isCheckedIn ? "PUT" : "POST";
        try {
            const res = await fetch(`${API_URL}/attendance/${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: user.email })
            });
            if (res.ok) { await syncStaffData(); Swal.fire({ title: "Success", icon: "success", timer: 1000, showConfirmButton: false }); }
        } catch (e) { Swal.fire("Error", "Server error", "error"); }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/leaves/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: user.email, reason: leaveReason, startDate: leaveDate, endDate: leaveDate })
            });
            if (res.ok) { syncStaffData(); Swal.fire("Sent", "Request submitted", "success"); setLeaveDate(""); setLeaveReason(""); }
        } catch (err) { Swal.fire("Error", "Submission failed", "error"); }
    };

    const deleteLeaveRecord = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/leaves/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { syncStaffData(); Swal.fire("Deleted", "Record removed", "success"); }
        } catch (err) { Swal.fire("Error", "Could not delete", "error"); }
    };

    return (
      <MDBox mt={2}>
          {activeTab === 0 && (
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <ModernCard title="Daily Presence" icon="schedule" color="info">
                        <MDBox textAlign="center" py={2}>
                            <MDBox display="flex" justifyContent="center" mb={3}>
                                {isCompleted ? (
                                  <MDButton variant="contained" color="secondary" disabled sx={{ width: 140, height: 140, borderRadius: "50%" }}>WORK<br/>DONE</MDButton>
                                ) : (
                                  <MDButton variant="gradient" color={isCheckedIn ? "warning" : "success"} sx={{ width: 140, height: 140, borderRadius: "50%" }} onClick={handleAttendance}>
                                      {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
                                  </MDButton>
                                )}
                            </MDBox>
                            {isCheckedIn && <Chip icon={<Icon>check_circle</Icon>} label={`Checked In at ${checkInTime}`} color="success" sx={{ color: "white" }} />}
                            {isCompleted && <MDBox><Chip label={`In: ${checkInTime}`} color="success" size="small" sx={{ mr: 1, color:"white" }} /><Chip label={`Out: ${checkOutTime}`} color="error" size="small" sx={{color:"white"}} /></MDBox>}
                        </MDBox>
                    </ModernCard>
                </Grid>
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ModernCard title="Apply for Absence" icon="event" color="dark">
                        <MDBox component="form" onSubmit={handleApplyLeave}>
                            <MDInput type="date" fullWidth value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{mb: 2}} />
                            <MDInput label="Reason" multiline rows={4} fullWidth value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{mb: 3}} />
                            <MDButton variant="gradient" color="info" fullWidth type="submit">Submit Request</MDButton>
                        </MDBox>
                    </ModernCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ModernCard title="Leave Status Log" icon="history" color="info">
                        {myLeaveHistory.length === 0 ? <MDTypography variant="button" color="text">No history found.</MDTypography> : (
                          <List>
                              {myLeaveHistory.map((item, i) => (
                                <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: "1px solid #f8f9fa" }} secondaryAction={ <IconButton edge="end" color="error" onClick={() => deleteLeaveRecord(item.id)}> <Icon>delete</Icon> </IconButton> }>
                                    <ListItemText primary={<MDTypography variant="button" fontWeight="bold">{item.startDate}</MDTypography>} secondary={<MDTypography variant="caption">{item.reason}</MDTypography>} />
                                    <Chip label={item.status} size="small" color={item.status === 'PENDING' ? 'warning' : item.status === 'APPROVED' ? 'success' : 'error'} sx={{ fontWeight: "bold", color: "white", mr: 2 }} />
                                </ListItem>
                              ))}
                          </List>
                        )}
                    </ModernCard>
                </Grid>
            </Grid>
          )}
      </MDBox>
    );
};

// ==============================
// 3. MAIN PROFILE (WITH WORKING SETTINGS)
// ==============================
function Profile() {
    const [activeTab, setActiveTab] = useState(0);
    const [user, setUser] = useState(null);

    // ✅ NEW STATE FOR EDITING
    const [editName, setEditName] = useState("");
    const [editPassword, setEditPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedRole = localStorage.getItem("role");
        if (!storedUser) { navigate("/authentication/sign-in"); return; }
        let finalRole = (storedRole || storedUser.role || "staff").toLowerCase();
        if (storedUser.email?.toLowerCase().includes("admin")) finalRole = "admin";

        const userData = { ...storedUser, role: finalRole };
        setUser(userData);
        setEditName(userData.fullName); // Pre-fill name
    }, [navigate]);

    // ✅ FUNCTION TO UPDATE PROFILE
    const handleSaveChanges = async () => {
        const token = localStorage.getItem("token");
        try {
            const payload = { fullName: editName, email: user.email };
            if (editPassword) payload.password = editPassword; // Only send password if changed

            const res = await fetch(`${API_URL}/auth/update/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // 1. Update Local Storage
                localStorage.setItem("user", JSON.stringify(updatedUser));
                // 2. Update State
                setUser({ ...updatedUser, role: user.role });
                setEditPassword(""); // Clear password field
                Swal.fire("Success", "Profile updated successfully!", "success");
            } else {
                Swal.fire("Error", "Failed to update profile", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server connection failed", "error");
        }
    };

    if (!user) return null;

    return (
      <DashboardLayout>
          <DashboardNavbar />
          <MDBox mb={2} />
          <MDBox position="relative" mb={5}>
              <MDBox display="flex" alignItems="center" position="relative" minHeight="12rem" borderRadius="xl" sx={{ background: "linear-gradient(135deg, #1a237e 0%, #344767 100%)", overflow: "hidden" }}>
                  <MDBox sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
              </MDBox>
              <Card sx={{ position: "relative", mt: -8, mx: 3, py: 3, px: 3, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)", borderRadius: "16px" }}>
                  <Grid container spacing={3} alignItems="center">
                      <Grid item><Avatar sx={{ width: 70, height: 70, bgcolor: "#344767", fontSize: "1.8rem" }}>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</Avatar></Grid>
                      <Grid item><MDBox lineHeight={1}><MDTypography variant="h4" fontWeight="bold">{user.fullName}</MDTypography><MDBox display="flex" alignItems="center" mt={0.5}><MDTypography variant="button" color="text" mr={1}>{user.email}</MDTypography><Chip label={user.role.toUpperCase()} size="small" color={user.role === 'admin' ? "error" : "success"} sx={{ fontWeight: "bold", color: "white", height: "20px" }} /></MDBox></MDBox></Grid>
                      <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
                          <AppBar position="static" sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                              <Tabs orientation="horizontal" value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ "& .MuiTabs-indicator": { height: "4px", borderRadius: "2px" } }}>
                                  <Tab label="Workspace" icon={<Icon>dashboard</Icon>} />
                                  <Tab label={user.role === 'admin' ? "Approvals" : "Leave Log"} icon={<Icon>fact_check</Icon>} />
                                  <Tab label="Settings" icon={<Icon>settings</Icon>} />
                              </Tabs>
                          </AppBar>
                      </Grid>
                  </Grid>
              </Card>
          </MDBox>
          <MDBox mb={5}>
              {activeTab !== 2 && (user.role === 'admin' ? <AdminDashboard activeTab={activeTab} /> : <StaffDashboard activeTab={activeTab} user={user} />)}

              {/* ✅ SETTINGS TAB (NOW FUNCTIONAL) */}
              {activeTab === 2 && (
                <ModernCard title="Account Settings" icon="security" color="dark">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={2}>ACCOUNT DETAILS</MDTypography>
                            {/* Input bound to editName state */}
                            <MDInput label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth sx={{mb:2}} />
                            <MDInput label="Email" value={user.email} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MDTypography variant="caption" fontWeight="bold" color="text" display="block" mb={2}>SECURITY</MDTypography>
                            {/* Input bound to editPassword state */}
                            <MDInput
                              label="New Password"
                              type="password"
                              fullWidth
                              placeholder="Leave blank to keep current"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              sx={{mb: 2}}
                            />
                            <MDBox display="flex" alignItems="center"><Switch defaultChecked /><MDTypography variant="button" color="text" ml={1}>Notifications</MDTypography></MDBox>
                        </Grid>
                        <Grid item xs={12} textAlign="right">
                            <Divider sx={{my: 3}} />
                            {/* Button calls handleSaveChanges */}
                            <MDButton variant="gradient" color="info" onClick={handleSaveChanges}>
                                Save Changes
                            </MDButton>
                        </Grid>
                    </Grid>
                </ModernCard>
              )}
          </MDBox>
          <Footer />
      </DashboardLayout>
    );
}

export default Profile;