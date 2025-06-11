import React from 'react'

function Logo({ width = "auto" }) {
  return (
    <div
      className="inline-block font-mono font-extrabold text-white text-xl md:text-3xl px-4 py-2  rounded-xl shadow-sm backdrop-blur-sm"
      style={{ width }}
    >
      Edu<span className="text-yellow-300">Share</span>
    </div>
  )
}

export default Logo
