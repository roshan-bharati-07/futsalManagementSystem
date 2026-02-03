class apiRepsonse {
    constructor(message, data,statusCode) {
        this.statusCode = statusCode || 200
        this.message = message
        this.data = data || null
        this.success = statusCode < 400
    }
}

export default apiRepsonse