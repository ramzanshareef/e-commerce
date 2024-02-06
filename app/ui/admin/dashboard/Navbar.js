"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminNavbar() {
    const router = useRouter();
    const navbarRef = useRef();
    const [showNavbar, setShowNavbar] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            var allCookies = document.cookie.split(';');
            for (var i = 0; i < allCookies.length; i++)
                document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();
            setLoggingOut(false);
            router.replace("/admin/login");
        }, 800);
    }

    return (
        <>
            <ToastContainer />
            <div className={` flex justify-center items-center h-screen ${loggingOut === true ? "" : "hidden"} `}>
                <ToastContainer />
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
            <div className="fixed top-0" >
                <div className={` shadow-sm border-r-2 border-blue-200 bg-blue-100 rounded-r-3xl min-h-screen overflow-auto transition-all w-14 fixed ${showNavbar === true ? "-left-4" : "left-0"} `}>
                    <GoSidebarCollapse color="black" size={35}
                        className={`cursor-pointer absolute top-3 left-2 `}
                        onClick={() => setShowNavbar(!showNavbar)}
                    />
                </div>
                <div className={` shadow-sm border-r-2 border-blue-200 bg-blue-100 rounded-r-3xl flex flex-col min-h-screen w-40 items-center space-y-2 overflow-auto z-50 transition-all fixed ${showNavbar === false ? "-left-96" : "left-0"} `}>
                    <div className="w-full p-5">
                        <GoSidebarExpand color="black" size={35}
                            className={`cursor-pointer absolute top-3 left-2 `}
                            onClick={() => setShowNavbar(!showNavbar)}
                        />
                    </div>
                    <div className="flex flex-col space-y-3 text-center">
                        <Link href="/admin/dashboard" className="cursor-pointer font-semibold p-2 hover:font-serif">Home
                        </Link>
                        <Link href="/admin/products" className="cursor-pointer font-semibold p-2 hover:font-serif">Products
                        </Link>
                        <Link href="/admin/orders" className="cursor-pointer font-semibold p-2 hover:font-serif">Orders
                        </Link>
                        <Link href="/admin/customers" className="cursor-pointer font-semibold p-2 hover:font-serif">Customers
                        </Link>
                        <Link href="/admin/settings" className="cursor-pointer font-semibold p-2 hover:font-serif">Settings
                        </Link>
                        <button onClick={handleLogout}
                            className="cursor-pointer font-semibold p-2 hover:font-serif">Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}