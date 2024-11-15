import { getOrCreateUser } from '../database/utils/users';

export default async function userMiddleware(req, res, next) {
    try {
        const deviceId = req.headers['deviceid'];
        if (deviceId) {
            const user = await getOrCreateUser(deviceId);

            if (!req.metadata) {
                req.metadata = {};
            }

            req.metadata.user = user;
        }
        next();
    } catch (error) {
        console.error('Error in user middleware:', error);
        next(error);
    }
}
