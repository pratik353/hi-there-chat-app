"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const db_1 = require("./db");
const socket_1 = require("./socket");
const conversation_routes_1 = require("./routes/conversation.routes");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
socket_1.app.use((0, cors_1.default)());
socket_1.app.use(express_1.default.json());
socket_1.app.get("/api/status", (req, res) => {
    res.json({ message: "Server is running" });
});
socket_1.app.use("/api/v1/auth", auth_routes_1.default);
socket_1.app.use("/api/v1/user", user_routes_1.default);
socket_1.app.use("/api/v1/conversation", conversation_routes_1.conversationRouter);
socket_1.app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist")));
socket_1.app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../frontend/dist/index.html"));
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            // server.listen(80,/* "192.168.101.5" */, () => {
            socket_1.server.listen(PORT, () => {
                console.log(`Example app listening at PORT:${PORT}`);
                resolve("");
            });
        });
        yield (0, db_1.connectDB)();
    });
}
init();
