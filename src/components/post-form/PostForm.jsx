import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        getValues
    } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            if (post) {
                // UPDATE POST
                let fileId = post.featuredimage;
                if (data.image?.[0]) {
                    const file = await appwriteService.uploadFile(data.image[0]);
                    if (file && file.$id) {
                        fileId = file.$id;
                        await appwriteService.deleteFile(post.featuredimage);
                    }
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredimage: fileId,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                    console.log("Post updated:", dbPost);
                } else {
                    alert("Failed to update the post.");
                }

            } else {
                // CREATE POST
                const file = await appwriteService.uploadFile(data.image[0]);
                if (!file || !file.$id) {
                    alert("File upload failed.");
                    return;
                }

                const dbPost = await appwriteService.createPost({
                    ...data,
                    featuredimage: file.$id,
                    userid: userData?.$id,
                    featuredimageType: file.mimeType
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                    console.log("Post created:", dbPost);
                } else {
                    alert("Failed to create the post.");
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Something went wrong during post submission.");
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s+/g, "-");
        return "";
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            {/* Left column */}
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE
                    label="Content :"
                    name="content"
                    control={control}
                    defaultValue={getValues("content")}
                />
            </div>

            {/* Right column */}
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif, application/pdf"
                    {...register("image", { required: !post })}
                />

                {post?.featuredimage && (
                    <div className="w-full mb-4">
                        <img
                            src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683475d00011cd7f5a9f/files/${post.featuredimage}/view?project=6834700a0019209ef7c8&mode=admin`}
                            alt={post.title}
                            className="rounded-lg"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        <a
                            href={`https://fra.cloud.appwrite.io/v1/storage/buckets/683475d00011cd7f5a9f/files/${post.featuredimage}/view?project=6834700a0019209ef7c8&mode=admin`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-500 underline mt-2"
                        >
                            View Current File
                        </a>
                    </div>
                )}

                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />

                <Button
                    type="submit"
                    bgColor={post ? "bg-green-500" : undefined}
                    className="w-full"
                >
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
