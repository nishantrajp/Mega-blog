// src/appwrite/config.js
import conf from "../conf/conf.js";
import { Client, ID, Databases, Storage, Query } from "appwrite";
import authService from './auth.js'; // Import your authService

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    // -------------------- Post Services --------------------

    // Modify createPost to potentially store the username if you want
    // However, fetching from profiles is more robust for display.
    async createPost({ title, slug, content, featuredimage, status, userid, username }) { // Added username here
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredimage,
                    status,
                    userid,
                    username: username || "Anonymous", // Store username directly if available, or default
                }
            );
        } catch (error) {
            console.error("Appwrite service :: createPost :: error", error);
            throw error; // Re-throw the error
        }
    }

    async updatePost(slug, { title, content, featuredimage, status, username }) { // Added username here
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredimage,
                    status,
                    username: username || "Anonymous", // Update username directly if available, or default
                }
            );
        } catch (error) {
            console.error("Appwrite service :: updatePost :: error", error);
            throw error;
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.error("Appwrite service :: deletePost :: error", error);
            return false;
        }
    }

    // *** IMPORTANT FIX HERE: Enrich getPost with username ***
    async getPost(slug) {
        try {
            const post = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );

            // Fetch the author's name using authService.getUserById
            let authorName = "Anonymous";
            if (post.userid) {
                const authorProfile = await authService.getUserById(post.userid);
                if (authorProfile?.name) {
                    authorName = authorProfile.name;
                } else {
                    // Fallback if no profile name found (e.g., deleted profile, or old post)
                    authorName = `User-${post.userid.substring(0, 4)}`;
                }
            }
            // Return the post object with the username attached
            return { ...post, username: authorName };
        } catch (error) {
            console.error("Appwrite service :: getPost :: error", error);
            return null; // Return null if post not found or error
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );

            // For AllPosts page, you might want to fetch all usernames too
            const postsWithUsernames = await Promise.all(
                response.documents.map(async (post) => {
                    let authorName = "Anonymous";
                    if (post.userid) {
                        const authorProfile = await authService.getUserById(post.userid);
                        if (authorProfile?.name) {
                            authorName = authorProfile.name;
                        } else {
                            authorName = `User-${post.userid.substring(0, 4)}`;
                        }
                    }
                    return { ...post, username: authorName };
                })
            );
            return { documents: postsWithUsernames, total: response.total };
        } catch (error) {
            console.error("Appwrite service :: getPosts :: error", error);
            return { documents: [] }; // Return empty array on error
        }
    }

    // -------------------- File Services --------------------

    async uploadFile(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.error("Appwrite service :: uploadFile :: error", error);
            return null; // Return null on error
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
            return true;
        } catch (error) {
            console.error("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
    }

    async getFileInfo(fileId) {
        try {
            return await this.bucket.getFile(conf.appwriteBucketId, fileId);
        } catch (error) {
            console.error("Appwrite service :: getFileInfo :: error", error);
            return null;
        }
    }

    // -------------------- Like Services --------------------

    async likePost(postId, userId) {
        try {
            // Check if already liked to avoid duplicate documents if using userId_postId as ID
            const existingLike = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("postId", postId), Query.equal("userId", userId)]
            );

            if (existingLike.documents.length === 0) {
                // If not liked, create a new like document
                return await this.databases.createDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteLikesCollectionId,
                    ID.unique(), // Use ID.unique() for flexibility, unless you specifically need userId_postId as document ID
                    { postId, userId }
                );
            }
            return existingLike.documents[0]; // Return the existing like
        } catch (error) {
            console.error("Appwrite service :: likePost :: error", error);
            throw error; // Propagate error
        }
    }


    async unlikePost(postId, userId) {
        try {
            // Find the specific like document to delete
            const existingLikes = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("postId", postId), Query.equal("userId", userId)]
            );

            if (existingLikes.documents.length > 0) {
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteLikesCollectionId,
                    existingLikes.documents[0].$id // Delete the found like document
                );
                return true;
            }
            return false; // No like found to unlike
        } catch (error) {
            console.error("Appwrite service :: unlikePost :: error", error);
            throw error; // Propagate error
        }
    }

    async getLikes(postId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("postId", postId)]
            );
            return { documents: response.documents, total: response.total };
        } catch (error) {
            console.error("Appwrite service :: getLikes :: error", error);
            return { documents: [] };
        }
    }

    // -------------------- Comment Services --------------------

    // *** IMPORTANT FIX HERE: Store 'name' directly for comments ***
    async addComment(postId, userId, content, name) { // Added 'name' parameter
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                ID.unique(),
                {
                    postId,
                    userId,
                    content,
                    name, // Store the name directly when adding the comment
                    timestamp: new Date().toISOString(), // Store as ISO string
                }
            );
        } catch (error) {
            console.error("Appwrite service :: addComment :: error", error);
            throw error;
        }
    }

    // *** IMPORTANT FIX HERE: Enrich getComments with username ***
    async getComments(postId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                [Query.equal("postId", postId), Query.orderAsc("timestamp")]
            );

            // If 'name' is already stored (from addComment), use it.
            // Otherwise, fetch it via getUserById (for older comments or if name wasn't stored).
            const commentsWithNames = await Promise.all(
                response.documents.map(async (comment) => {
                    if (comment.name) {
                        return comment; // If name is already in the comment document, use it
                    }

                    let commentAuthorName = "Anonymous";
                    if (comment.userId) {
                        const authorProfile = await authService.getUserById(comment.userId);
                        if (authorProfile?.name) {
                            commentAuthorName = authorProfile.name;
                        } else {
                            commentAuthorName = `User-${comment.userId.substring(0, 4)}`;
                        }
                    }
                    return { ...comment, name: commentAuthorName }; // Attach name to the comment object
                })
            );
            return { documents: commentsWithNames, total: response.total };
        } catch (error) {
            console.error("Appwrite service :: getComments :: error", error);
            return { documents: [] };
        }
    }
}

const service = new Service();
export default service;