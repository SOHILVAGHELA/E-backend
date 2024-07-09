import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import fs from "fs";
import { log } from "console";

// Controller to Create A Product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name) {
      return res.status(400).send({ error: "Name is required" });
    }
    if (!description) {
      return res.status(400).send({ error: "Description is required" });
    }
    if (!price) {
      return res.status(400).send({ error: "Price is required" });
    }
    if (!category) {
      return res.status(400).send({ error: "Category is required" });
    }
    if (!quantity) {
      return res.status(400).send({ error: "Quantity is required" });
    }
    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
    });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path); // Corrected from 'photo' to 'photo.path'
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error occurred while creating product",
    });
  }
};

//Get All Product Controller
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counttotal: products.length,
      message: "All Product",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Geting All Product",
      error: error.message,
    });
  }
};
//Get SIngle Product controoler
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: " succefully get single prdouct ",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succss: false,
      error,
      massge: "error while geting single product",
    });
  }
};
// Get Product Photo Controller
export const productPhotoCnntroller = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.send(500).send({
      success: false,
      message: "Error while geting product photo",
      error,
    });
  }
};

//Delete Controller
export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel
      .findByIdAndDelete(req.params.pid)
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "successfully deleted",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Deleting Product",
      error,
    });
  }
};

// Prdoct Update Controller
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name) {
      return res.status(400).send({ error: "Name is required" });
    }
    if (!description) {
      return res.status(400).send({ error: "Description is required" });
    }
    if (!price) {
      return res.status(400).send({ error: "Price is required" });
    }
    if (!category) {
      return res.status(400).send({ error: "Category is required" });
    }
    if (!quantity) {
      return res.status(400).send({ error: "Quantity is required" });
    }
    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path); // Corrected from 'photo' to 'photo.path'
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error occurred while updating product",
    });
  }
};
//Filter Product controller
export const productFilterController = async (req, res) => {
  try {
    // Step 1: Log incoming request body
    console.log("Incoming request body:", req.body);

    // Step 2: Destructure checked and radio from req.body
    const { checked, radio } = req.body;

    // Step 3: Initialize args object
    let args = {};

    // Step 4: Construct MongoDB query based on checked and radio
    if (checked && checked.length > 0) {
      args.category = { $in: checked };
    }

    if (radio && radio.length === 2) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }

    // Step 5: Log the constructed query arguments
    console.log("Query args:", args);

    // Step 6: Perform MongoDB query
    const products = await productModel.find(args);

    // Step 7: Send success response with products
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    // Step 8: Log and handle errors
    console.log("Error:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while filtering products",
    });
  }
};
//serach controller
export const searchProductController = async (req, res) => {
  try {
    // Extract keyword from request parameters with error handling
    const { keyword } = req.params;
    if (!keyword) {
      return res.status(400).send({
        success: false,
        message: 'Missing required parameter "keyword"',
      });
    }

    // Perform case-insensitive search using regular expression
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo"); // Exclude photo field

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while searching product",
      error: process.env.NODE_ENV === "production" ? undefined : error, // Only include error details in non-production environments
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    const products = await productModel
      .find({ category: category._id })
      .populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting products",
      error: error.message,
    });
  }
};
