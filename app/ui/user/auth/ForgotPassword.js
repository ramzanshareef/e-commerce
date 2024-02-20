"use client"

import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { generateUserResetPasswordToken } from "@/app/actions/userAuth";
import { SubmitButton } from "../../Submitbutton";
import { useFormState } from 'react-dom';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { userAuth } from "@/middlewares/auth";


export default function ForgotPassword() {
    const [state, loginAction] = useFormState(generateUserResetPasswordToken, null);
    const router = useRouter();

    useEffect(() => {
        userAuth().then((res) => {
            if (res === true) {
                router.replace("/");
            }
        })
    }, []);

    useEffect(() => {
        if (state?.status !== 200) {
            toast.error(state?.message, {
                position: "top-right",
                autoClose: 1800,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClose: () => {
                    document.getElementById("passwordRestTokenForm").reset();
                },
            });
        }
        else if (state?.status === 200) {
            toast.success("Email with Reset Details have been sent to the Registered Email ID (if exists)", {
                position: "top-right",
                autoClose: 1200,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                onClose: () => {
                    document.getElementById("passwordRestTokenForm").reset();
                    router.replace("/login");
                },
            });
        }
    }, [state]);

    return (
        <>
            <div className="min-h-screen">
                <ToastContainer />
                <div className="flex flex-col min-h-full justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center justify-center">
                        <Image src="/logo.png" alt="logo" width={100} height={100}
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Reset your password</h2>
                    </div>
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form action={loginAction} className="space-y-6" id="passwordRestTokenForm">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Enter your registered Email ID</label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 p-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50" />
                                </div>
                            </div>

                            <div>
                                <SubmitButton title="Reset Password" />
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm text-gray-500">
                            Already have an account? &nbsp;
                            <Link href={"/login"} className="font-semibold leading-6 text-blue-600 hover:text-blue-500" >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

}