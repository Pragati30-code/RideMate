"use client";

import { useState } from "react";

export default function RiderDashboard() {

  const [pickup,setPickup] = useState("");
  const [drop,setDrop] = useState("");
  const [time,setTime] = useState("");
  const [fare,setFare] = useState<number | null>(null);

  const calculateFare = () => {

    if(!pickup || !drop) return;

    // temporary fare logic (backend later)
    const baseFare = 40;
    const distanceFare = Math.floor(Math.random()*50);

    setFare(baseFare + distanceFare);
  };

  const searchRide = async () => {

    const rideData = {
      pickup,
      drop,
      time
    };

    try{

      const res = await fetch("/api/rides/search",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(rideData)
      });

      console.log("Searching rides...",rideData);

    }catch(err){
      console.log(err);
    }

  };

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-200">

      <div className="w-[450px] bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Book a Ride 🚗
        </h1>

        <div className="space-y-4">

          <input
            placeholder="Pickup Location"
            className="w-full border p-2 rounded-md text-gray-700"
            value={pickup}
            onChange={(e)=>setPickup(e.target.value)}
          />

          <input
            placeholder="Drop Location"
            className="w-full border p-2 rounded-md text-gray-700"
            value={drop}
            onChange={(e)=>setDrop(e.target.value)}
          />

          <input
            type="time"
            className="w-full border p-2 rounded-md text-gray-700"
            value={time}
            onChange={(e)=>setTime(e.target.value)}
          />

          <button
            onClick={calculateFare}
            className="w-full bg-indigo-500 text-white py-2 rounded-md"
          >
            Estimate Fare
          </button>

          {fare && (

            <div className="bg-green-100 p-3 rounded-md text-center">

              Estimated Fare: ₹{fare}

            </div>

          )}

          <button
            onClick={searchRide}
            className="w-full bg-green-500 text-white py-2 rounded-md"
          >
            Search Available Rides
          </button>

        </div>

      </div>

    </div>
  )
}
