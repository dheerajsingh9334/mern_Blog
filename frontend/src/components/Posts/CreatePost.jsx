import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPostAPI } from "../../APIServices/posts/postsAPI";
import AlertMessage from "../Alert/AlertMessage";
import { fetchCategoriesAPI } from "../../APIServices/category/categoryAPI";
const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const postMutation = useMutation({
    mutationKey: ["create-post"],
    mutationFn: createPostAPI,
  });

  const { data } = useQuery({
    queryKey: ["category-lists"],
    queryFn: fetchCategoriesAPI,
  });

  const formik = useFormik({
    initialValues: {
      description: "",
      image: null,
      category: "",
    },
    // validationSchema: Yup.object({
    //   description: Yup.string().required("Description is required"),
    //   image: Yup.mixed().required("Image is required"),
    //   category: Yup.string().required("Category is required"),
    // }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("description", values.description);
      formData.append("image", values.image);
      formData.append("category", values.category);

      // Debug
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      postMutation.mutate(formData, {
        onError: (error) => {
          console.error("Mutation error:", error);
          console.error("Full error response:", error?.response);
          console.error("Error data:", error?.response?.data);
        }
      });
    }
  });

  // ✅ move these outside onSubmit
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      setImageError("File size exceeds 1MB");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setImageError("Invalid file type");
      return;
    }

    setImageError(""); 
    formik.setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(null);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 m-4">
        <h2 className="text-2xl font-bold text-center mb-8">Add New Post</h2>

        {postMutation.isLoading && <AlertMessage type="loading" message="Loading..." />}
        {postMutation.isSuccess && <AlertMessage type="success" message="Post created successfully!" />}
        {postMutation.isError && (
          <AlertMessage type="error" message={postMutation?.error?.response?.data?.message || "Error creating post"} />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <ReactQuill
              value={description}
              onChange={(value) => {
                setDescription(value);
                formik.setFieldValue("description", value);
              }}
              className="h-40"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-600">{formik.errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <Select
              options={data?.categories?.map((cat) => ({
                value: cat._id,
                label: cat.categoryName,
              }))}
              onChange={(option) => formik.setFieldValue("category", option.value)}
              value={
                formik.values.category
                  ? {
                      value: formik.values.category,
                      label:
                        data?.categories?.find((c) => c._id === formik.values.category)?.categoryName || "",
                    }
                  : null
              }
              className="mt-1 block w-full"
            />
            {formik.touched.category && formik.errors.category && (
              <p className="text-sm text-red-600">{formik.errors.category}</p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor="image"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            >
              Choose a file
            </label>

            {formik.touched.image && formik.errors.image && (
              <p className="text-sm text-red-600">{formik.errors.image}</p>
            )}
            {imageError && <p className="text-sm text-red-600">{imageError}</p>}

            {imagePreview && (
              <div className="mt-2 relative">
                <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-full" />
                <button type="button" onClick={removeImage} className="absolute right-0 top-0 p-1 bg-white rounded-full">
                  ✖
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
          >
            Add Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;