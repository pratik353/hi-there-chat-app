import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as yup from "yup";
import { useFormik } from "formik";
import InputField from "@/components/form/InputField";
import { instance } from "@/services/api";
import { EyeClosed, EyeIcon } from "lucide-react";
import { useState } from "react";

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    // .matches(
    //   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    //   "Password must be at least 6 characters, and include at least one letter, one number, and one special character."
    // )
    .required(),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { values, handleChange, handleSubmit, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        name: "",
        email: "",
        password: "",
      },
      async onSubmit(values) {
        try {
          const response = await instance.post("/user/register", values);
          if (response.data.success) {
            toast.success(" User register successfully");
            navigate('/login')
          }
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          toast.error(error?.message);
        }
      },
      validationSchema,
    });

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-4">
            <h1 className="text-3xl font-semibold mb-2 text-black text-center">
              Register
            </h1>
            <h1 className="text-sm font-semibold mb-2 text-gray-500 text-center">
              Join to keep chat with your loved once
            </h1>
            <form className="space-y-2" onSubmit={handleSubmit}>
              <InputField
                label="Full Name"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && errors.name ? errors.name : undefined}
                onBlur={handleBlur}
              />
              <InputField
                label="Email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && errors.email ? errors.email : undefined}
                onBlur={handleBlur}
              />
              <div className="flex relative">
                <InputField
                  label="Password"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.password && errors.password
                      ? errors.password
                      : undefined
                  }
                  className="w-[90%] "
                />
                {!showPassword ? (
                  <EyeClosed
                    className="absolute right-0 top-1/2 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                ) : (
                  <EyeIcon
                    className="absolute right-0 top-1/2 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black  focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-black hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
