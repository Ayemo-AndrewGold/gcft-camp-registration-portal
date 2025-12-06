'use client';

import { Bell, Moon, Search, Sun } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminHeader() {

  const router = useRouter();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    }
  };
  return (
    <header className='fixed top-0 left-65 right-0 h-16 bg-linear-to-l from-blue-100 via-white to-green-300 border-b border-gray-200 shadow-md z-40 dark:linear-to-l from-blue-100 via-white to-green-300 text-[#0E0E1D] dark:text-[#0E0E1D]'>
      <div className='h-full px-6 flex items-center justify-between'>
        <div className='flex items-center gap-5'>
          <h1 className='font-semibold text-[1.5rem]'>Welcome!👋</h1>
          <div className='flex items-center px-4 py-2 
              bg-gray-100 rounded-4xl
              border border-gray-200 
              focus:outline-none
              focus:ring-2
              focus:ring-green-300
              focus:border-transparent'>
                <input type="text"
                placeholder='Search...'
                className='focus:ring-none
              focus:ring-0
              focus:outline-none
              bg-gray-100
              focus:ring-green-300'
                />
                <Search />
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <Bell
            size={32}
            className='cursor-pointer bg-white p-1 rounded-full'/> 
            <button className={`flex items-center gap-1 bg-gray-200 p-1 rounded-full cursor-pointer `}>
              <Sun size={30} className='bg-white p-1 rounded-full' /> <Moon size={30} className='p-1' /> 
            </button>
            <div className='flex items-center gap-2'>
              <Image 
                src='/images/avata.webp'
                alt='admin'
                width={50}
                height={50}
                className='w-10 h-10 rounded-full bg-gray-300'
                priority
                />
                <div>
                  <h2 className='font-semibold' >
                    John Amakata
                  </h2>
                  <p className='text-[12px]'>
                    Admin
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-1 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
            </div>
        </div>

      </div>
    </header>
  )
}
