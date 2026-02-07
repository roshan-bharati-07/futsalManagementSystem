class apiResponse {
    constructor(message, data,statusCode) {
        this.statusCode = statusCode || 200
        this.message = message
        this.data = data || null
        this.success = true
    }
}

export default apiResponse