// src/pages/AllPosts.jsx
import React, { useState, useEffect } from 'react';
import { Container, PostCard } from '../components';
import appwriteService from "../appwrite/config";
import { ClipLoader } from 'react-spinners';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = useQuery();
  const search = query.get("search")?.toLowerCase() || "";

useEffect(() => {
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedPosts = await appwriteService.getPosts([]);
      if (fetchedPosts) {
        const allPosts = fetchedPosts.documents;

        const filteredPosts = search
          ? allPosts.filter(post => {
              const title = post.title?.toLowerCase() || "";
              const content = post.content?.toLowerCase() || "";
              return title.includes(search.toLowerCase()) || content.includes(search.toLowerCase());
            })
          : allPosts;

        setPosts(filteredPosts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to fetch posts in AllPosts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [search]);


  // --- UI States ---
  if (loading) {
    return (
      <div className='w-full py-20 bg-gradient-to-br from-blue-100 to-indigo-200 flex justify-center items-center min-h-screen'>
        <ClipLoader color={'#3B82F6'} loading={loading} size={50} />
        <p className="ml-3 text-lg font-semibold text-gray-700">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full py-20 bg-red-100 text-red-700 flex justify-center items-center min-h-screen'>
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className='w-full py-20 bg-gradient-to-br from-blue-50 to-purple-100 flex justify-center items-center min-h-screen'>
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Posts Found</h2>
          <p className="text-lg text-gray-600">Try searching for something else.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full py-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen'>
      <Container>
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 pb-4 border-b-4 border-blue-400 max-w-2xl mx-auto">
          {search ? `Results for "${search}"` : "Explore All Posts"}
        </h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4'>
          {posts.map((post) => (
            <div key={post.$id} className='col-span-1'>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default AllPosts;
