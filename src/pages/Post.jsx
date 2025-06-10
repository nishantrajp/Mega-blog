// src/pages/Post.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config"; // Ensure correct import
import authService from "../appwrite/auth";     // Ensure correct import
import { Button, Container } from "../components"; // Ensure Button and Container are well-styled
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { FiFileText, FiDownload, FiEye, FiExternalLink, FiEdit2, FiTrash2, FiHeart, FiMessageSquare, FiCalendar, FiUser } from "react-icons/fi";
import moment from "moment";
import { ClipLoader } from 'react-spinners';

export default function Post() {
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);

    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    // Use a clearer name for the currently logged-in user's display name
    const currentUserNameForComment = userData?.name || (userData?.$id ? `User-${userData.$id.substring(0, 4)}` : "Guest");


    // --- File Info and PDF Detection ---

    useEffect(() => {
        if (post?.featuredimage) {
            const getFileInfo = async () => {
                try {
                    const info = await appwriteService.getFileInfo(post.featuredimage);
                    setFileInfo(info);
                } catch (error) {
                    console.error("Error getting file info in Post.jsx useEffect:", error);
                    setFileInfo(null);
                }
            };
            getFileInfo();
        } else {
            setFileInfo(null);
        }
    }, [post]); // Re-run when `post` changes

    const isPdf = useMemo(() => {
        if (!post?.featuredimage) return false;

        // Priority 1: Check from live fetched fileInfo (after `getFileInfo` fix)
        if (fileInfo?.mimeType?.includes('pdf')) {
            console.log("isPdf: Detected PDF via live fetched mimeType.");
            return true;
        }

        // Fallback to file extension (less reliable if Appwrite doesn't store extensions in ID)
        const fileExt = post.featuredimage.split('.').pop().toLowerCase();
        if (fileExt === 'pdf') {
            console.log("isPdf: Detected PDF via file extension fallback.");
            return true;
        }

        console.log("isPdf: Not detected as PDF.");
        return false;
    }, [post, fileInfo]); // Re-run when `post` or `fileInfo` changes

    // Construct file URLs
    const fileUrl = post?.featuredimage
        ? `${import.meta.env.VITE_APPWRITE_URL}/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${post.featuredimage}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}&mode=admin`
        : '';
    const pdfViewerUrl = isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` : '';

    const isAuthor = post && userData ? post.userid === userData.$id : false;

    // --- Main Data Loading Effect ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null); // Clear any previous errors

                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);

                if (slug) {
                    // getPost now returns the post with 'username' attached
                    const fetchedPost = await appwriteService.getPost(slug);
                    if (fetchedPost) {
                        setPost(fetchedPost);

                        // getComments now returns comments with 'name' attached
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
            } catch (err) {
                setError("Failed to load post. Please try again.");
                console.error("Failed to load post data in Post.jsx useEffect:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug, navigate]); // Dependencies: re-run if slug or navigate changes


    // --- Interaction Handlers ---

    const deletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            try {
                const isDeleted = await appwriteService.deletePost(post.$id);
                if (isDeleted && post.featuredimage) {
                    await appwriteService.deleteFile(post.featuredimage);
                }
                navigate("/");
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Failed to delete post. Please try again.");
            }
        }
    };

    const toggleLike = async () => {
        if (!user) {
            alert("Please log in to like posts.");
            return;
        }

        try {
            const alreadyLiked = likes.some(like => like.userId === user?.$id);
            if (alreadyLiked) {
                await appwriteService.unlikePost(post.$id, user.$id);
            } else {
                await appwriteService.likePost(post.$id, user.$id);
            }
            const updatedLikes = await appwriteService.getLikes(post.$id);
            setLikes(updatedLikes?.documents || []);
        } catch (error) {
            console.error("Failed to toggle like:", error);
            alert("Failed to toggle like. Please try again.");
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        if (!user) {
            alert("Please log in to comment.");
            return;
        }

        try {
            // Pass the current user's display name to addComment
            await appwriteService.addComment(post.$id, user.$id, commentInput, currentUserNameForComment);
            setCommentInput('');
            const updatedComments = await appwriteService.getComments(post.$id);
            setComments(updatedComments?.documents || []);
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert("Failed to add comment. Please try again.");
        }
    };

    const isLiked = likes.some(like => like.userId === user?.$id);

    // --- Loading, Error, Not Found States ---
    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader
                        color={'#3B82F6'}
                        loading={loading}
                        size={50}
                        aria-label="Loading Content"
                        data-testid="loader"
                    />
                    <p className="ml-3 text-lg font-semibold text-gray-700">Loading post details...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="text-center py-12 text-red-600 text-xl bg-red-50 rounded-lg shadow-md">
                    <p>Error: {error}</p>
                    <p className="text-base text-red-500 mt-2">Please try refreshing the page or check your connection.</p>
                </div>
            </Container>
        );
    }

    if (!post) {
        return (
            <Container>
                <div className="text-center py-20 text-gray-700 text-xl bg-white rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold mb-4">Post Not Found</h2>
                    <p>The post you are looking for might not exist or is no longer accessible.</p>
                    <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
                        Go back to homepage
                    </Link>
                </div>
            </Container>
        );
    }

    // --- Main Content Render ---
    return (
        <div className="py-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <Container>
                {/* Post Header & Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-gray-600 text-sm md:text-base gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                                <FiUser size={16} className="text-blue-500" /> Posted by <span className="font-semibold text-gray-800">{post.username || "Anonymous"}</span> {/* Should now be populated */}
                            </span>
                            <span className="flex items-center gap-1">
                                <FiCalendar size={16} className="text-purple-500" /> {moment(post.$createdAt).format('MMMM D, YYYY [at] h:mm A')} {/* Added YYYY for full date */}
                            </span>
                        </div>
                    </div>
                    {isAuthor && (
                        <div className="flex gap-3 flex-wrap justify-end">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 text-base rounded-lg shadow-md transition-colors duration-200">
                                    <FiEdit2 size={18} /> Edit
                                </Button>
                            </Link>
                            <Button
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-base rounded-lg shadow-md transition-colors duration-200"
                                onClick={deletePost}
                            >
                                <FiTrash2 size={18} /> Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Featured Content Section */}
                <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 overflow-hidden">
                    {isPdf ? (
                        <div className="flex flex-col items-center w-full p-8 bg-blue-50 rounded-lg border border-blue-200">
                            <FiFileText className="text-8xl text-blue-600 mb-6 drop-shadow-md" />
                            <h2 className="text-2xl font-bold mb-4 text-blue-800">This is a PDF Document</h2>
                            <p className="text-gray-700 text-center mb-6 max-w-md">
                                You can view, download, or open this PDF directly in your browser.
                            </p>
                            <div className="flex gap-4 flex-wrap justify-center w-full max-w-lg">
                                <a
                                    href={pdfViewerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg font-medium"
                                >
                                    <FiEye size={20} /> View
                                </a>
                                <a
                                    href={fileUrl}
                                    download
                                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-lg font-medium"
                                >
                                    <FiDownload size={20} /> Download
                                </a>
                                <button
                                    onClick={() => window.open(fileUrl, '_blank')}
                                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md text-lg font-medium"
                                >
                                    <FiExternalLink size={20} /> Open Directly
                                </button>
                            </div>
                            <p className="mt-6 text-sm text-gray-500 text-center">
                                (The 'View' option uses Google Docs Viewer for embedding. For the best experience, consider downloading or opening directly.)
                            </p>
                        </div>
                    ) : (
                        <div className="relative w-full h-[500px] overflow-hidden rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center">
                            <img
                                src={fileUrl}
                                alt={post.title}
                                className="object-contain h-full w-full rounded-lg"
                                onError={(e) => {
                                    e.target.src = "/images/placeholder.png";
                                    e.target.alt = "Image not available";
                                    e.target.className += " opacity-50";
                                }}
                            />
                            {post.featuredimage && (fileInfo === null || fileInfo?.mimeType === 'application/octet-stream') && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-lg font-medium">
                                    Image failed to load or is not a common format.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Content Area */}
                <div className="w-full bg-white p-8 rounded-xl shadow-lg mb-8">
                    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif">
                        {parse(post.content)}
                    </div>
                </div>

                {/* Engagement Section (Likes & Comments Count) */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex items-center gap-8 justify-start md:justify-center flex-wrap">
                        <Button
                            onClick={toggleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${isLiked ? 'bg-red-600 text-white shadow-lg hover:bg-red-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md'}`}
                        >
                            <FiHeart className={isLiked ? 'fill-current' : ''} size={22} />
                            {likes.length} Like{likes.length !== 1 ? 's' : ''}
                        </Button>

                        <div className="flex items-center gap-2 text-gray-600 text-xl font-medium">
                            <FiMessageSquare size={22} />
                            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8 bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 pb-4 border-blue-400">Comments</h2>

                    {comments.length === 0 ? (
                        <p className="text-gray-500 mb-8 text-lg text-center">No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                        <div className="space-y-6 mb-8">
                            {comments.map(comment => (
                                <div key={comment.$id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                            <FiUser size={18} className="text-blue-400" />
                                            {comment?.name ?? "Anonymous"} {/* Should now be populated */}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {moment(comment.$createdAt).fromNow()}
                                        </p>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-base">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comment Input Form */}
                    <form onSubmit={submitComment} className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-5">
                        <h3 className="text-xl font-semibold text-gray-700">Leave a Comment</h3>
                        <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Write your comment here..."
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 resize-y"
                            required
                        ></textarea>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold self-end shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!commentInput.trim() || !user}
                        >
                            Post Comment
                        </Button>
                        {!user && (
                            <p className="text-sm text-red-500 text-right mt-2">
                                You must be logged in to post a comment.
                            </p>
                        )}
                    </form>
                </div>
            </Container>
        </div>
    );
}