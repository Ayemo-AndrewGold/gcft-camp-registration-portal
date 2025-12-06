import React from 'react'
import { useRouter } from 'next/navigation';

const AlreadyRegistered = () => {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push("/register");
  };
  return (
    <section className="flex pt-10 flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Number Already Registered</h1>
    <button
      arial-label="Register A New Number"
      className="py-5 text-white bg-[#85C061] px-10 mt-10 sm:mt-30 text-center text-[2rem]"
      onClick={handleRegisterClick}
    >
      Register A New Number
    </button>  
    </section>
  )
}

export default AlreadyRegistered