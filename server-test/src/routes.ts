import { Hono } from "hono";
import dashboard from "./features/dashboard/dashboard.routes.js";
import users from "./features/users/users.routes.js";
import files from "./features/files/files.routes.ts";
import test from "./features/test/test.routes.ts";

const routes = new Hono();

routes.route("/dashboard", dashboard);
routes.route("/users", users);
routes.route("/files", files);
routes.route("/test", test)

export default routes;
