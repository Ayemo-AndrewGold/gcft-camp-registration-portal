"use client";

import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import axios from "axios";

const RegisteredCampersCount: React.FC = () => {
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await axios.get(
          "https://gcft-camp.onrender.com/api/v1/analytics/total-users"
        );
        // Adjust depending on your backend response
        setRegistrationCount(res.data.total_users || 0);
      } catch (err) {
        console.error("Error fetching total registered users:", err);
        setError("Unable to load campers count");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUsers();
  }, []);

  return (
    <section className="w-full mx-auto mt-5 sm:mt-10 bg-white dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]">
      <div className="flex flex-col md:flex-row justify-center gap-10">
        <div ref={ref} className="flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#85C061] border-t-transparent mb-3"></div>
              <p className="text-gray-500 text-lg">Loading campers...</p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-lg">{error}</p>
          ) : (
            <div className="text-center">
              <p className="text-6xl font-bold text-[#0E0E1D] font-lato">
                {inView ? (
                  <CountUp end={registrationCount} duration={3} separator="," />
                ) : (
                  "0"
                )}
              </p>
              <p className="text-[#85C061] text-2xl font-semibold mt-2">
                Campers Registered
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisteredCampersCount;
