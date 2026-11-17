const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const router = express.Router();

// Google OAuth Client
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString()
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};

// Email transporter
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// GOOGLE LOGIN API
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required."
            });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email?.toLowerCase();
        const name = payload.name;

        if (!googleId || !email || !payload.email_verified || !name) {
            return res.status(401).json({
                success: false,
                message: "Google account verification failed."
            });
        }

        // Find existing user by Google ID or email
        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            // Link Google account to existing email account
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new Google user
            user = await User.create({
                name,
                email,
                googleId
            });
        }

        // Generate application JWT
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Google login successful!",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        return res.status(401).json({
            success: false,
            message: "Google authentication failed."
        });
    }
});

// USER REGISTRATION API
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            token,
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// USER LOGIN API
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// FORGOT PASSWORD API
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Same response whether the email exists or not
        const genericMessage =
            "If an account exists with this email, a password reset link has been sent.";

        if (!user) {
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only the hashed token
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const appUrl = (
            process.env.APP_URL || "http://localhost:5500"
        ).replace(/\/+$/, "");

        const resetLink =
    `${appUrl}/reset-password.html?token=${resetToken}`;

        try {
            const transporter = createEmailTransporter();

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: user.email,
                subject: "BlogSpace - Password Reset",
                text: `Hello ${user.name},

We received a request to reset your BlogSpace password.

Open this link to create a new password:
${resetLink}

This link expires in 15 minutes. If you did not request this, ignore this email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 25px; color: #333;">
                        <h2>Reset Your BlogSpace Password</h2>
                        <p>Hello ${user.name},</p>
                        <p>We received a request to reset your password.</p>
                        <p>
                            <a href="${resetLink}"
                               style="display: inline-block; padding: 12px 22px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                                Reset Password
                            </a>
                        </p>
                        <p>This link expires in 15 minutes.</p>
                        <p>If you did not request this, you can ignore this email.</p>
                    </div>
                `
            });

        } catch (emailError) {
            console.error("Password reset email error:", emailError.message);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: genericMessage
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process your request right now."
        });
    }
});

// RESET PASSWORD API
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        // Hash the token received from the reset link
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with a valid, unexpired token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password right now."
        });
    }
});

module.exports = router;
