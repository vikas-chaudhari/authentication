import axios from "axios";
import { AtSign, CircleUserRound, LockKeyhole, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("login details : ", { email, password });

    const loginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password Must include an uppercase letter")
        .regex(/[a-z]/, "Password Must include a lowercase letter")
        .regex(/[0-9]/, "Password Must include a number")
        .regex(/[^A-Za-z0-9]/, "Password Must include a special character"),
    });

    const isValidated = loginSchema.safeParse({ email, password });

    if (!isValidated.success) {
      console.log("validation error: ", isValidated.error.errors);
      setError(isValidated.error.errors[0].message);
      return;
    }
    await axios
      .post("http://localhost:3000/login", { email, password })
      .then((res) => {
        console.log("login response : ", res);
        if (res.status === 200) {
          localStorage.setItem("token", res.data.token);
          navigate("/");
          setError("");
        } else {
          setError(res.data.error);
        }
      })
      .catch((err) => {
        console.error("Login error: ", err);
        setError(err.response.data.error);
      });
  };
  return (
    <div className="relative bg-slate-800 rounded-2xl flex flex-col justify-center items-center text-white gap-4 px-8 py-5 w-[500px] shadow-lg shadow-slate-900">
      <h1 className="relative -top-7 bg-teal-300 text-3xl px-4 py-2 uppercase rounded-sm text-gray-800">
        sign in
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
          <AtSign className="text-gray-500" size={35} />
          <div className="w-[3px] h-[35px] rounded-full bg-gray-500"></div>
          <input
            type="text"
            placeholder="Email"
            className="w-full outline-none text-2xl text-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex w-full items-center bg-gray-700 rounded-md gap-2 px-2 py-2 mb-2">
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
      <div className="flex w-full justify-between items-center text-teal-400 text-sm mb-2">
        <div className="flex justify-center items-center gap-2 ">
          <input type="checkbox" className="cursor-pointer w-5 h-5" />
          <p className="text-xl">remember me</p>
        </div>
        <p className="text-xl">forgot your password?</p>
      </div>
      <button
        className="w-full mt-5 cursor-pointer bg-teal-300 text-3xl px-4 py-2 uppercase rounded-sm text-gray-800"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
