"use client";

import { useState } from "react";

export default function RiderDashboard(){

  const [pickup,setPickup] = useState("");
  const [drop,setDrop] = useState("");
  const [time,setTime] = useState("");
  const [fare,setFare] = useState<number | null>(null);

  const calculateFare=()=>{

    if(!pickup || !drop) return;

    const baseFare = 40;
    const randomDistance = Math.floor(Math.random()*50);

    setFare(baseFare + randomDistance);
  }

  const searchRide = async ()=>{

    const rideData={
      pickup,
      drop,
      time
    };

    console.log("Searching ride",rideData);

    await fetch("/api/rides/search",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(rideData)
    });

  }

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="w-[420px] bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-center mb-6">
          Book a Ride 🚗
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Pickup Location"
            className="w-full border border-slate-200 rounded-lg px-4 py-2"
            value={pickup}
            onChange={(e)=>setPickup(e.target.value)}
          />

          <input
            placeholder="Drop Location"
            className="w-full border border-slate-200 rounded-lg px-4 py-2"
            value={drop}
            onChange={(e)=>setDrop(e.target.value)}
          />

          <input
            type="time"
            className="w-full border border-slate-200 rounded-lg px-4 py-2"
            value={time}
            onChange={(e)=>setTime(e.target.value)}
          />

          <button
            onClick={calculateFare}
            className="w-full bg-indigo-500 text-white py-2 rounded-lg"
          >
            Estimate Fare
          </button>

          {fare && (

            <div className="bg-green-100 text-center p-3 rounded-lg">

              Estimated Fare: ₹{fare}

            </div>

          )}

          <button
            onClick={searchRide}
            className="w-full bg-green-500 text-white py-2 rounded-lg"
          >
            Search Rides
          </button>

        </div>

      </div>

    </div>
  )
}
