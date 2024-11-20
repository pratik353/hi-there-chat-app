export class HTTPError extends Error {
    code = 500;
    constructor(message: string, code: number = 500,) {
      super(message);
      this.code = code;
    }
  }