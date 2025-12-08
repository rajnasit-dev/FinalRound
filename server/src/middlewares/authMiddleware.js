import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/User.model.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
    try{
        const accessToken = req.cookies.accessToken;
        if(!accessToken) throw new ApiError(401, "Unauthorized: Token not found");
    
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if(!user) throw new ApiError(404, "User not found.");
    
        req.user = user;
        return next();
    }catch(error){
        throw new ApiError(401, "Invalid Access Token.");
    }
};