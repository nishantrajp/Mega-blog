import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import authService from "../appwrite/auth"; // import auth service to get user
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [user, setUser] = useState(null);

    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const name = userData.name
    
    const isAuthor = post && userData ? post.userid === userData.$id : false;

    useEffect(() => {
        const loadData = async () => {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            if (slug) {
                const fetchedPost = await appwriteService.getPost(slug);
                if (fetchedPost) {
                    setPost(fetchedPost);
                    const [likesRes, commentsRes] = await Promise.all([
                        appwriteService.getLikes(fetchedPost.$id),
                        appwriteService.getComments(fetchedPost.$id)
                    ]);
                    setLikes(likesRes?.documents || []);
                    setComments(commentsRes?.documents || []);
                } else {
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };

        loadData();
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredimage);
                navigate("/");
            }
        });
    };

    const toggleLike = async () => {
        const alreadyLiked = likes.some(like => like.userId === user?.$id);
        if (alreadyLiked) {
            await appwriteService.unlikePost(post.$id, user.$id);
        } else {
            await appwriteService.likePost(post.$id, user.$id);
        }
        const updatedLikes = await appwriteService.getLikes(post.$id);
        setLikes(updatedLikes?.documents || []);
    };

    const submitComment = async () => {
        if (!commentInput.trim()) return;
        await appwriteService.addComment(post.$id, user.$id,commentInput,name);
        setCommentInput('');
        const updatedComments = await appwriteService.getComments(post.$id);
        setComments(updatedComments?.documents || []);
    };

    const isLiked = likes.some(like => like.userId === user?.$id);

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2">
                    <img
                        src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683475d00011cd7f5a9f/files/${post.featuredimage}/view?project=6834700a0019209ef7c8&mode=admin`}
                        alt={post.title}
                        className="rounded-xl md:h-[350px] md:w-[300px]"
                    />

                    {isAuthor && (
                        <div className="absolute right-6 top-6">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="w-full mb-6">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>

                <div className="browser-css mb-4">
                    {parse(post.content)}
                </div>

                {/* Likes */}
                <div className="mb-4">
                    <Button onClick={toggleLike} bgColor="bg-blue-500">
                        {isLiked ? "Unlike" : "Like"} ({likes.length})
                    </Button>
                </div>

                {/* Comments */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Comments</h2>

                    {comments.length === 0 && (
                        <p className="text-gray-500">No comments yet.</p>
                    )}

                    {comments.map(comment => (
                        <div key={comment.$id} className="mb-3 p-2 border rounded">
                            <p className="text-sm text-gray-600">User : {comment.name}</p>
                            <p>{comment.content}</p>
                        </div>
                    ))}

                    <div className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Write a comment..."
                            className="border rounded p-2 flex-grow"
                        />
                        <Button onClick={submitComment} bgColor="bg-green-600">
                            Post
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
