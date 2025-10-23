"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_route_1 = require("../modules/auth/auth.route");
const book_route_1 = require("../modules/book/book.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/book",
        route: book_route_1.BookRoutes,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
