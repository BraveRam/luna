import { Hono } from "hono";
import dashboard from "./routes/dashboard/dashboard.routes.ts";
import users from "./routes/users/users.routes.ts";
import files from "./routes/files/files.routes.ts";
import test from "./routes/test/test.routes.ts";

const routes = new Hono();

routes.route("/dashboard", dashboard);
routes.route("/users", users);
routes.route("/files", files);
routes.route("/test", test)

export default routes;
