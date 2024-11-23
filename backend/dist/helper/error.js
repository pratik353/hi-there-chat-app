"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPError = void 0;
class HTTPError extends Error {
    constructor(message, code = 500) {
        super(message);
        this.code = 500;
        this.code = code;
    }
}
exports.HTTPError = HTTPError;
