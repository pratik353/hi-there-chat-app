"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.generateToken = exports.secretKey = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.secretKey = "yourSecretKey"; // Replace with your own secret key
const generateToken = (payload) => {
    const options = {
        expiresIn: "1h", // Token expiration time
    };
    const token = jsonwebtoken_1.default.sign(Object.assign({}, payload), exports.secretKey, options);
    return token;
};
exports.generateToken = generateToken;
function decodeToken(token) {
    const user = jsonwebtoken_1.default.verify(token, exports.secretKey);
    return user;
}
exports.decodeToken = decodeToken;
