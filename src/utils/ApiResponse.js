// src/utils/ApiResponse.js
export class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
  }

  static success(message, data) {
    return new ApiResponse(true, message, data);
  }

  static error(message, data) {
    return new ApiResponse(false, message, data);
  }
}
