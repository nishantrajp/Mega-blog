import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiDownload, FiEye } from 'react-icons/fi';
import altImg from '../assets/altImg.gif';
import pdfimg from '../assets/paper_2.jpg';

function PostCard({ $id, title, featuredimage }) {
  const isPdf = featuredimage?.endsWith('.pdf');
  const fileUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/683475d00011cd7f5a9f/files/${featuredimage}/view?project=6834700a0019209ef7c8&mode=admin`;

  return (
    <div className="w-full bg-gray-100 rounded-xl p-4 transition-transform transform hover:scale-105 hover:shadow-lg">
      <div className="flex justify-center mb-4">
        {isPdf ? (
          <div className="flex flex-col items-center">
            <FiFileText className="text-6xl text-gray-700 mb-2" />
            <div className="flex gap-3">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <FiEye /> View
              </a>
              <a
                href={fileUrl}
                download
                className="text-green-600 hover:underline flex items-center gap-1"
              >
                <FiDownload /> Download
              </a>
            </div>
          </div>
        ) : (
          <img
            src={fileUrl}
            alt={title}
            onError={(e) => {
              e.target.src = pdfimg;
            }}
            className="rounded-lg object-cover w-full md:w-[300px] md:h-[250px]"
          />
        )}
      </div>
      <Link to={`/post/${$id}`}>
        <h2 className="text-xl font-bold text-gray-800 mt-3 hover:underline">{title}</h2>
      </Link>
    </div>
  );
}

export default PostCard;