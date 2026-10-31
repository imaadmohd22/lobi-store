
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestDB() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    async function checkDatabase() {
      const { error } = await supabase
        .from("products")
        .select("id")
        .limit(1);

      if (error) {
        setMessage("Error: " + error.message);
      } else {
        setMessage("LOBI Database Connected Successfully!");
      }
    }

    checkDatabase();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f3] p-10">
      <h1 className="text-3xl font-bold text-[#293b2b]">
        LOBI Database Test
      </h1>
      <p className="mt-5 text-lg">{message}</p>
    </main>
  );
}
