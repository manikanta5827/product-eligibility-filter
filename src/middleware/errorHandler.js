const logger = require('../utils/winstonLogger.js');
const path = require('path');

const errorHandler = (err, req, res, next) => {
    let errorMessage = err.message;

    const stack = err.stack;
    if (stack) {
        const stackLines = stack.split('\n');
        const firstStackLine = stackLines[1];

        if (firstStackLine) {
            const match = firstStackLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
                const functionName = match[1];
                const filePath = match[2];
                const lineNumber = match[3];
                const fileName = path.basename(filePath);

                let logMessage = `[CRITICAL]: Error happened in file::${fileName} Line::${lineNumber} FunctionName::${functionName} Message::${errorMessage}`;
                logger.warn(logMessage);
            } else {
                logger.warn(`[CRITICAL]: Error - ${errorMessage}`);
            }
        } else {
            logger.warn(`[CRITICAL]: Error - ${errorMessage}`);
        }
    } else {
        logger.warn(`[CRITICAL]: Error - ${errorMessage}`);
    }

    res.status(500).send({
        status: "error",
        message: 'Something went wrong!',
        error: errorMessage
    });
}

module.exports = errorHandler;