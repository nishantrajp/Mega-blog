// src/appwrite/auth.js
import conf from "../conf/conf.js";
import { Client, Account, ID, Databases, Query } from "appwrite"; // Import Databases and Query

export class AuthService {
    client = new Client();
    account;
    databases; // Add a databases client to interact with collections like 'profiles'

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
        this.databases = new Databases(this.client); // Initialize Databases
    }

    async createAccount({ email, password, name }) {
        try {
            const userAccount = await this.account.create(
                ID.unique(),
                email,
                password,
                name
            );
            if (userAccount) {
                // If account creation is successful, create a profile entry
                await this.createProfile({ userId: userAccount.$id, name }); // Create profile
                return this.login({ email, password });
            } else {
                return userAccount;
            }
        } catch (error) {
            console.error("Appwrite service :: createAccount :: error", error); // Log error for debugging
            throw error; // Re-throw to propagate the error to the calling component
        }
    }

    async login({ email, password }) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error("Appwrite service :: login :: error", error); // Log error
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            // console.log is fine here, as it's common for users not to be logged in
            console.log("Appwrite service :: getCurrentUser :: error", error);
        }
        return null;
    }

    async logout() {
        try {
            await this.account.deleteSessions();
            return true; // Indicate successful logout
        } catch (error) {
            console.log("Appwrite service :: logout :: error", error);
            return false; // Indicate failed logout
        }
    }

    // New method to create a user profile in a dedicated 'profiles' collection
    // This should be called right after a user successfully signs up.
    async createProfile({ userId, name }) {
        try {
            // Ensure you have a 'profiles' collection with attributes like 'userId' (string) and 'name' (string)
            // with appropriate read/write permissions for client-side access.
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                userId, // Use userId as document ID for easy lookup
                {
                    userId,
                    name
                }
            );
        } catch (error) {
            console.error("Appwrite service :: createProfile :: error", error);
            // Don't re-throw here usually, as signup might still proceed without a profile
            // but log it for debugging data consistency issues.
        }
    }

    // New method to get a user's profile by their userId
    // This will be used by appwrite/config.js to get names for posts/comments.
    async getUserById(userId) {
        if (!userId) {
            console.warn("AuthService :: getUserById :: userId is null or undefined.");
            return null;
        }
        try {
            // Query the 'profiles' collection to find the user's name
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                [Query.equal("userId", userId), Query.limit(1)] // Fetch max 1 document
            );

            if (response.documents.length > 0) {
                return response.documents[0]; // Returns the profile document (e.g., { $id: "...", userId: "...", name: "..." })
            }
            return null; // No profile found
        } catch (error) {
            console.error("AuthService :: getUserById :: error", error);
            return null;
        }
    }
}

const authService = new AuthService();

export default authService;