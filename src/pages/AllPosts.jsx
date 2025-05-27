import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";

function AllPosts() {
    const [posts, setPosts] = useState([])
    useEffect(() => {}, [])
    appwriteService.getPosts([]).then((posts) => {
        if (posts) {
            setPosts(posts.documents)
        }
    })
  return (
    <div className='w-full py-8  bg-[#d1e3f6]'>
        <Container>
            <div className='flex flex-wrap '>
                {posts.map((post) => (
                    <div key={post.$id} className='p-2 md:w-1/3 h-150  w-200 '>
                        <PostCard  {...post} />
                    </div>
                ))}
            </div>
            </Container>
    </div>
  )
}

export default AllPosts