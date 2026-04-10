import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // 1. Check if the user is saved in browser memory
    const user = localStorage.getItem("user");

    // 2. If no user found, KICK them back to Sign In
    if (!user) {
        return <Navigate to="/authentication/sign-in" replace />;
    }

    // 3. If user exists, let them in
    return children;
};

export default ProtectedRoute;