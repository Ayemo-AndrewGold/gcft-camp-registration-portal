"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { AiOutlineDashboard, } from 'react-icons/ai'
import { FiUser, FiCreditCard, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi'
import { Hotel, HandHeart, User, LogOut } from "lucide-react";
import Image from 'next/image';


export default function AdminSidebar () {

  const links = [
    {href: '/admin', label: 'Dasboard', icon: AiOutlineDashboard},
    {href: '/admin/users', label: 'User Management', icon: User},
    {href: '/admin/hostel', label:  'Hostel Management', icon: Hotel},
    {href: '/admin/donation', label: 'Donation Analytics', icon: HandHeart},
    {href: '/admin/settings', label: 'Settings', icon: FiSettings},
    {href: '/admin/logout', label: 'Logout', icon: LogOut},
  ]

  const pathname = usePathname()
  return (
    <aside className='w-65 font-[lexend] left-0 top-0 h-screen fixed bg-linear-to-b from-blue-100 via-white to-green-300 border-r border-gray-200 shadow-md p-4 dark:linear-to-b from-blue-100 via-white to-green-300 text-[#0E0E1D] dark:text-[#0E0E1D]'>
      <div className='flex items-center font-semibold text-[1.2rem] gap-1'>
        <Image 
         src='/images/gcftLogo.svg'
         alt='GCFT Logo'
         height={40}
         width={40}
         priority
         className='rounded-full'
        />
        <h2 className='text-green-500'>
          GCFT Church
        </h2>
      </div>
      <nav className='flex flex-col gap-2'>
        <p className='font-medium mt-6 mb-4'>General
        </p>
        {links.map(({href, label, icon:Icon}) =>(
          <Link
            key={`${label}-${href}`}
            href={href}
            className={`flex items-center gap-2 p-2 hover:bg-gray-200 ${pathname === href ? 'text-white bg-linear-to-l from-green-600 via-green-400 to-green-600 font-bold  rounded-[2rem]' : 'text-gray-900 hover:bg-linear-to-l from-green-300 via-white to-green-300 hover:rounded-4xl hover:font-semibold'}`}
          >
            <span className='bg-white border border-gray-200 rounded-full text-gray-800  p-[0.3rem]'><Icon size={20}
            className={`${pathname === href ? 'text-green-600' : ''}`}
            /></span>
            <span>{label}</span>
          </Link>
        ))}

      </nav>
    </aside>
  )
}
