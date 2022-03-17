import { ValidationError } from "../utils/errors.js";

export function errorHandler(err, req, res, next) {
    console.log('salut');
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            description: err.description,
        });
    } else {
        res.status(500).json({
            description: "Server error",
        });
    }
}
