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
exports.deleteConversation = exports.updateConversation = exports.createConversation = exports.getConversationDetails = exports.getUserConversation = void 0;
const zod_1 = __importDefault(require("zod"));
const conversation_schema_1 = require("../models/conversation.schema");
const error_1 = require("../helper/error");
const conversationSchema = zod_1.default.object({
    participants: zod_1.default.array(zod_1.default.string()),
    groupName: zod_1.default.string().optional(),
    isPrivate: zod_1.default.boolean().optional(),
    groupImage: zod_1.default.string().optional(),
});
const getUserConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const type = req.query.type;
    try {
        const userConversations = yield conversation_schema_1.ConversationModel.find({
            $and: [
                { participants: { $in: [userId] } },
                { isGroup: type == "groups" }, // Check if conversation is active
            ],
        }).populate("participants", "_id name email groupName groupImage admin profilePic");
        let publicGroups = [];
        if (type == "groups") {
            publicGroups = yield conversation_schema_1.ConversationModel.find({
                $and: [
                    { participants: { $nin: [userId] } },
                    { isGroup: true },
                    { isPublic: true }, // Check if conversation is active
                ],
            }).populate("participants", "_id name email groupName groupImage admin profilePic");
        }
        res.json({ data: [...userConversations, ...publicGroups] });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUserConversation = getUserConversation;
const getConversationDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    try {
        const conversation = yield conversation_schema_1.ConversationModel.findById(conversationId)
            .select("-messages")
            .populate("participants", "_id name email groupName groupImage admin profilePic");
        res.json({ data: conversation });
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
exports.getConversationDetails = getConversationDetails;
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const user = req.user;
    const type = req.query.type;
    try {
        const validationRes = conversationSchema.safeParse(payload);
        if (!validationRes.success) {
            res.status(400).json({ error: validationRes.error.issues });
            return;
        }
        const { participants, groupName, isPublic, groupImage } = payload;
        let inputData = {
            participants,
        };
        if (type == "group") {
            inputData = Object.assign(Object.assign({}, inputData), { isGroup: true, groupName: groupName, groupImage: groupImage, isPublic: isPublic, admin: user === null || user === void 0 ? void 0 : user._id });
        }
        const conversation = yield conversation_schema_1.ConversationModel.create(inputData);
        conversation.save();
        res.status(201).json({
            message: "conversation created successfully",
            data: conversation,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createConversation = createConversation;
const updateConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    const payload = req.body;
    try {
        if (payload.joinId) {
            const conversation = yield conversation_schema_1.ConversationModel.findByIdAndUpdate(conversationId, {
                $push: {
                    participants: Array.isArray(payload.joinId)
                        ? payload.joinId
                        : [payload.joinId],
                },
            });
            res.json({ success: true });
            return;
        }
        if (payload.leaveId) {
            const conversation = yield conversation_schema_1.ConversationModel.findByIdAndUpdate(conversationId, { $pull: { participants: payload.leaveId } });
            res.json({ success: true });
            return;
        }
        const conversation = yield conversation_schema_1.ConversationModel.findByIdAndUpdate(conversationId, {
            $set: payload,
        });
        res.json({ success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateConversation = updateConversation;
const deleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    try {
        const conversation = yield conversation_schema_1.ConversationModel.findByIdAndDelete(conversationId);
        res.json({ success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteConversation = deleteConversation;
