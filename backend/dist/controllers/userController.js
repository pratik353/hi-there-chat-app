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
exports.updateUserDetails = exports.getAllUSers = exports.getUserDetails = exports.registerUser = exports.loginUser = void 0;
const error_1 = require("../helper/error");
const user_schema_1 = require("../models/user.schema");
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const helper_1 = require("../helper");
const userLoginSchema = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
// Object input validation
const userRegisterSchema = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string(),
    name: zod_1.default.string(), //  = either IN or US
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    try {
        const response = userLoginSchema.safeParse(payload);
        if (!response.success) {
            throw new error_1.HTTPError("invalid inputs", 400);
        }
        const user = yield user_schema_1.UserModel.findOne({ email: payload.email });
        if (!user) {
            throw new error_1.HTTPError("User does not exist with this email", 401);
        }
        const validatePassword = yield bcrypt_1.default.compare(payload.password, user.password);
        if (!validatePassword) {
            throw new error_1.HTTPError("Invalid password", 401);
        }
        const token = (0, helper_1.generateToken)({ id: user._id, email: user.email });
        const updatedUser = yield user_schema_1.UserModel.findByIdAndUpdate(user._id, {
            token: token,
        });
        res.json({
            message: "User logged in successfully",
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof error_1.HTTPError) {
            res.status(error.code).send({
                success: false,
                message: error.message,
            });
        }
        else {
            res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
});
exports.loginUser = loginUser;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const zodRes = userRegisterSchema.safeParse(payload);
    try {
        if (!zodRes.success) {
            throw new error_1.HTTPError("invalid inputs", 400);
        }
        const existingUser = yield user_schema_1.UserModel.findOne({ email: payload.email });
        if (existingUser) {
            throw new error_1.HTTPError("User already exists", 400);
        }
        const salt = yield bcrypt_1.default.genSalt(10); // 10 means length of 10 chars
        const hashedPassword = yield bcrypt_1.default.hash(payload.password, salt);
        const newUser = new user_schema_1.UserModel({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
        });
        yield newUser.save();
        res.json({ message: "register user successfully", success: true });
    }
    catch (error) {
        if (error instanceof error_1.HTTPError) {
            res.status(error.code).send({
                success: false,
                message: error.message,
            });
        }
        else {
            res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
});
exports.registerUser = registerUser;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield user_schema_1.UserModel.findById(userId).select("-password");
    res.json({ data: user });
});
exports.getUserDetails = getUserDetails;
const getAllUSers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const users = yield user_schema_1.UserModel.find({ _id: { $ne: user === null || user === void 0 ? void 0 : user._id } }).select("-password");
    res.json({ data: users });
});
exports.getAllUSers = getAllUSers;
const updateUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const payload = req.body;
    const user = yield user_schema_1.UserModel.findByIdAndUpdate(userId, {
        $set: payload,
    });
    res.json({ message: "User updated successfully", success: true });
});
exports.updateUserDetails = updateUserDetails;
