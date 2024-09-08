const sendResponse = (res, status, message, data = null, error = null) => {
    res.json({
        status,
        message,
        data,
        error,
    })
}

export default sendResponse;