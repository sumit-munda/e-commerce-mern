import { createBrowserRouter } from "react-router-dom";

import storefrontRoutes from "./storefrontRoutes";
import adminRoutes from "./adminRoutes";

const router = createBrowserRouter([
    ...storefrontRoutes,
    ...adminRoutes
])

export default router;