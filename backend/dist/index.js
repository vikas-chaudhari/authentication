"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = require("zod");
const middleware_1 = require("./middleware");
mongoose_1.default
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/authentication")
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, email, dateofbirth } = req.body;
    const ZodDateFromString = zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    })
        .transform((val) => new Date(val));
    const userSchema = zod_1.z.object({
        name: zod_1.z.string().min(3).max(20),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must include an uppercase letter")
            .regex(/[a-z]/, "Must include a lowercase letter")
            .regex(/[0-9]/, "Must include a number")
            .regex(/[^A-Za-z0-9]/, "Must include a special character"),
        email: zod_1.z.string().email(),
        dateofbirth: ZodDateFromString,
    });
    const isValidated = userSchema.safeParse({
        name,
        password,
        email,
        dateofbirth,
    });
    if (!isValidated.success) {
        res.status(400).json({ error: isValidated.error.errors });
        return;
    }
    const existingUser = yield db_1.userModel.findOne({ name });
    if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
    }
    if (name && password && email && dateofbirth) {
        const newUser = new db_1.userModel({ name, password, email, dateofbirth });
        yield newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    else {
        res.status(400).json({ error: "Invalid data" });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const loginSchema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must include an uppercase letter")
            .regex(/[a-z]/, "Must include a lowercase letter")
            .regex(/[0-9]/, "Must include a number")
            .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    });
    const isValidated = loginSchema.safeParse({ email, password });
    if (!isValidated.success) {
        res.status(400).json({ error: isValidated.error.errors });
        return;
    }
    const user = yield db_1.userModel.findOne({ email, password });
    if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }
    else {
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    }
}));
app.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = [
        {
            name: "micheal holz",
            dateCreated: "10/03/2025 ",
            role: "admin",
            status: "active",
        },
        {
            name: "paula wilson",
            dateCreated: "15/08/2013 ",
            role: "publisher",
            status: "inactive",
        },
        {
            name: "james smith",
            dateCreated: "20/01/2020 ",
            role: "editor",
            status: "suspended",
        },
        {
            name: "sarah johnson",
            dateCreated: "25/12/2018 ",
            role: "admin",
            status: "active",
        },
        {
            name: "david brown",
            dateCreated: "30/06/2015 ",
            role: "publisher",
            status: "inactive",
        },
        {
            name: "emily jones",
            dateCreated: "05/11/2021 ",
            role: "editor",
            status: "suspended",
        },
        {
            name: "michael garcia",
            dateCreated: "10/03/2022 ",
            role: "admin",
            status: "active",
        },
        {
            name: "jessica martinez",
            dateCreated: "15/08/2019 ",
            role: "publisher",
            status: "inactive",
        },
        {
            name: "william lopez",
            dateCreated: "20/01/2021 ",
            role: "editor",
            status: "suspended",
        },
        {
            name: "olivia gonzalez",
            dateCreated: "25/12/2020 ",
            role: "admin",
            status: "active",
        },
        {
            name: "james wilson",
            dateCreated: "30/06/2017 ",
            role: "publisher",
            status: "inactive",
        },
        {
            name: "sophia taylor",
            dateCreated: "05/11/2018 ",
            role: "editor",
            status: "suspended",
        },
        {
            name: "benjamin thomas",
            dateCreated: "10/03/2016 ",
            role: "admin",
            status: "active",
        },
    ];
    res.json(users);
}));
app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});
