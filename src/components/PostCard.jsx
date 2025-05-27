import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'
import  altImg from '../assets/altImg.gif'

function PostCard({$id, title, featuredimage}) {
    
    
  return (
    <Link to={`/post/${$id}`} >
    <div className="w-full bg-gray-100 rounded-xl p-4 transition-transform transform hover:scale-105 hover:shadow-lg  ">
      <div className="flex justify-center mb-4">
        <img
          src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683475d00011cd7f5a9f/files/${featuredimage}/view?project=6834700a0019209ef7c8&mode=admin`}
          alt={title}
          onError={(e)=>{
            e.target.src = altImg
          }}
          className="rounded-lg object-cover w-full md:w-[300px] md:h-[250px]"
        />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mt-3">{title}</h2>
    </div>
  </Link>

  )
}


export default PostCard