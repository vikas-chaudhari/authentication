import {
  AtSign,
  CalendarDays,
  CircleUserRound,
  LockKeyhole,
  User,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    console.log("Registering:", { name, dob, email, password });

    // validation using zod
    const ZodDateFromString = z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .transform((val) => new Date(val));

    const userSchema = z.object({
      name: z.string().min(3).max(20),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[0-9]/, "Must include a number")
        .regex(/[^A-Za-z0-9]/, "Must include a special character"),
      email: z.string().email(),
      dateofbirth: ZodDateFromString,
    });

    const isValidated = userSchema.safeParse({
      name,
      password,
      email,
      dateofbirth: dob,
    });

    if (!isValidated.success) {
      setError(isValidated.error.errors[0].message);
      console.log("validation error: ", isValidated.error.errors);
      return;
    }

    // axios post request to the backend
    axios
      .post("http://localhost:3000/register", {
        name,
        password,
        email,
        dateofbirth: dob,
      })
      .then((res) => {
        console.log("Registration response : ", res.data);
        if (res.status === 201) {
          navigate("/login");
          setError("");
        } else {
          setError(res.data.error);
        }
      })
      .catch((err) => {
        console.error("Registration error: ", err);
        setError(err.response.data.error);
      });
  };

  return (
    <div className="relative bg-slate-800 rounded-2xl flex flex-col justify-center items-center text-white gap-4 px-8 py-5 w-[500px] shadow-lg shadow-slate-900">
      <h1 className="relative -top-7 bg-teal-300 text-3xl px-4 py-2 uppercase rounded-sm text-gray-800">
        sign up
      </h1>
      <div>
        <CircleUserRound className="text-gray-500" size={200} strokeWidth={1} />
      </div>
      {error && (
        <div className="bg-red-500 text-white text-center py-2 px-4 rounded-md w-full">
          {error}
        </div>
      )}
      <div className="flex mt-5 w-full flex-col justify-center items-center">
        <div className="flex w-full items-center bg-gray-700 rounded-md gap-2 px-2 py-2 mb-3">
          <User className="text-gray-500" size={35} />
          <div className="w-[3px] h-[35px] rounded-full bg-gray-500"></div>
          <input
            type="text"
            placeholder="Name"
            className="w-full outline-none text-2xl text-gray-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center bg-gray-700 rounded-md gap-2 px-2 py-2 mb-3">
          <CalendarDays className="text-gray-500" size={35} />
          <div className="w-[3px] h-[35px] rounded-full bg-gray-500"></div>
          <input
            type="date"
            placeholder="Date of Birth"
            className="w-full outline-none text-2xl text-gray-300"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center bg-gray-700 rounded-md gap-2 px-2 py-2 mb-3">
          <AtSign className="text-gray-500" size={35} />
          <div className="w-[3px] h-[35px] rounded-full bg-gray-500"></div>
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none text-2xl text-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center bg-gray-700 rounded-md gap-2 px-2 py-2 mb-3">
          <LockKeyhole className="text-gray-500" size={35} />
          <div className="w-[3px] h-[35px] rounded-full bg-gray-500"></div>
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none text-2xl text-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className="w-full cursor-pointer mt-5 bg-teal-300 text-3xl px-4 py-2 uppercase rounded-sm text-gray-800"
        onClick={handleRegister}
      >
        register
      </button>
    </div>
  );
};

export default Register;
