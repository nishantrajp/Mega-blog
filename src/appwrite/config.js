import conf from '../conf/conf.js'; 
import { Client, ID, Databases, Storage, Query } from "appwrite";



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

    async createPost({ title, slug, content, featuredimage, status, userid }) {
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
                }
            );
        } catch (error) {
            console.error("Appwrite service :: createPost :: error", error);
        }
    }

    async updatePost(slug, { title, content, featuredimage, status }) {
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
                }
            );
        } catch (error) {
            console.error("Appwrite service :: updatePost :: error", error);
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

    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.error("Appwrite service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.error("Appwrite service :: getPosts :: error", error);
            return false;
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
            return false;
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

    // -------------------- Like Services --------------------

    async likePost(postId, userId) {
        try {
            const likeId = `${userId}_${postId}`;
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                likeId,
                {
                    postId,
                    userId,
                }
            );
        } catch (error) {
            console.error("Appwrite service :: likePost :: error", error);
            return false;
        }
    }

    async unlikePost(postId, userId) {
        try {
            const likeId = `${userId}_${postId}`;
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                likeId
            );
            return true;
        } catch (error) {
            console.error("Appwrite service :: unlikePost :: error", error);
            return false;
        }
    }

    async getLikes(postId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("postId", postId)]
            );
        } catch (error) {
            console.error("Appwrite service :: getLikes :: error", error);
            return false;
        }
    }

    // -------------------- Comment Services --------------------

   async addComment(postId, userId, content,name) {

    try {
        return await this.databases.createDocument(
            conf.appwriteDatabaseId,
            conf.appwriteCommentsCollectionId,
            ID.unique(),
            {
                postId,
                userId,
                content,
                name,
                timestamp: new Date(), // ✅ use Date object directly for Appwrite datetime type
            }
        );
    } catch (error) {
        console.error("Appwrite service :: addComment :: error", error);
        return false;
    }
}

    async getComments(postId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                [Query.equal("postId", postId), Query.orderAsc("timestamp")]
            );
        } catch (error) {
            console.error("Appwrite service :: getComments :: error", error);
            return false;
        }
    }
}

const service = new Service();
export default service;
