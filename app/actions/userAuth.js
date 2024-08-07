"use server"

import User from "@/models/User";
import connectDB from "./connectDB";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendResetPasswordMail } from "./emailer";

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;


export async function userSignup(currentState, formData) {
    let name = formData.get('name');
    let email = formData.get('email');
    let password = formData.get('password');
    if (name === "" || email === "" || password === "") {
        return { status: 400, message: "All fields are required" };
    }
    else {
        try {
            await connectDB();
            let user = await User.findOne({ email: email });
            if (user) {
                return { status: 400, message: "Email already taken" };
            }
            else {
                let salt = bcryptjs.genSaltSync(10);
                password = bcryptjs.hashSync(password, salt);
                let newUser = new User({
                    name: name,
                    email: email,
                    password: password
                });
                await newUser.save();
                return { status: 200, message: "Signed up succesfully, please login" };
            }
        }
        catch (err) {
            return { status: 500, message: "Internal server error" };
        }
    }

}

export async function userLogin(currentState, formData) {
    let email = formData.get('email');
    let password = formData.get('password');
    if (email === "" || password === "") {
        return { status: 400, message: "All fields are required" };
    }
    else {
        try {
            await connectDB();
            let user = await User.findOne({ email: email });
            if (user) {
                let isMatch = await bcryptjs.compare(password, user.password);
                if (isMatch) {
                    let token = jwt.sign({
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }, jwt_secret, { expiresIn: "2d" });
                    // let salt = bcryptjs.genSaltSync(10);
                    // token = bcryptjs.hashSync(token, salt);
                    cookies().set("userToken", token, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 2, // 2 days
                        sameSite: "lax",
                        secure: process.env.NODE_ENV === "production",
                        httpOnly: true
                    });
                    return { status: 200, token: token, message: "Login successful" };
                }
                else {
                    return { status: 400, message: "Invalid Credentials" };
                }
            }
            else {
                return { status: 400, message: "Invalid Credentials" };
            }
        }
        catch (err) {
            return { status: 500, message: "Internal server error" };
        }

    }
}

export async function getUser(token, id) {
    try {
        if (id !== undefined && id !== null && id !== "") {
            await connectDB();
            let user = await User.findById(id).select("-password");
            return { status: 200, user: JSON.parse(JSON.stringify(user)) };
        }
        await connectDB();
        let decoded = jwt.verify(token, jwt_secret);
        let user = await User.findById(decoded.id).select("-password");
        return { status: 200, id: decoded.id, user: user };
    }
    catch (err) {
        return { status: 500, message: "Invalid Session" };
    }
}

export async function userLogout() {
    cookies().set("userToken", "", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        httpOnly: true
    });
    revalidatePath("/");
    return { status: 200, message: "Logout successful" };
}

export async function fetchUserDetails() {
    let token = cookies().get("userToken");
    if (token && token.value) {
        try {
            await connectDB();
            let decoded = jwt.verify(token.value, jwt_secret);
            let user = await User.findById(decoded.id).select("-password");
            return { status: 200, user: JSON.parse(JSON.stringify(user)) };
        }
        catch (err) {
            return { status: 500, message: "Invalid Session" };
        }
    }
    else {
        return { status: 400, message: "Invalid Session" };
    }
}

export async function generateUserResetPasswordToken(currentState, formData) {
    let email = formData.get('email');
    if (email === "") {
        return { status: 400, message: "Email is required" };
    }
    else {
        try {
            await connectDB();
            let token = generateRandomString(20);
            let user = await User.findOne({ email: email });
            if (user) {
                let res = await sendResetPasswordMail(email, token);
                if (res.status === 200) {
                    user.passwordResetToken = token;
                    await user.save();
                    return { status: 200, token: token, message: "Token generated and E Mail sent" };
                }
                else {
                    return { status: 400, message: "Email not sent" };
                }
            }
            else {
                return { status: 400, message: "Email not found" };
            }
        }
        catch (err) {
            console.log(err.message)
            return { status: 500, message: "Internal server error" };
        }
    }
}

function generateRandomString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function resetUserPassword(currentState, formData) {
    let password = formData.get('password');
    let cpassword = formData.get('cpassword');
    let token = formData.get('token');
    let userID = formData.get('userID');
    if (password !== cpassword) {
        return { status: 400, message: "Passwords do not match" };
    }
    else if (password === "" || cpassword === "" || token === "" || userID === "") {
        return { status: 400, message: "Invalid Details" };
    }
    else if (password.length < 6) {
        return { status: 400, message: "Password should be atleast 6 characters" };
    }
    else {
        try {
            await connectDB();
            let user = await User.findById(userID);
            if (user) {
                if (user.passwordResetToken === token) {
                    let salt = bcryptjs.genSaltSync(10);
                    password = bcryptjs.hashSync(password, salt);
                    user.password = password;
                    user.passwordResetToken = "";
                    await user.save();
                    return { status: 200, message: "Password reset successful" };
                }
                else {
                    return { status: 400, message: "Invalid Details" };
                }
            }
            else {
                return { status: 400, message: "Invalid User" };
            }
        }
        catch (err) {
            return { status: 500, message: "Internal server error" };
        }
    }
}