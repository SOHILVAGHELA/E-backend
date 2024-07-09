
import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import { categoryController,createCategoryController,  deleteCategoryController,  singleCategoryController,  updateCategoryController } from "../controllers/categoryController.js";
const router=express.Router();
//routes
//create catergory
router.post('/create-category',requireSignIn,isAdmin,createCategoryController)

//  update category
router.put("/update-category/:id",requireSignIn,isAdmin,  updateCategoryController)

//get all category
router.get("/get-category",categoryController)

//single category 
router.get("/single-category/:slug",singleCategoryController)

//delete catergory
router.delete("/delete-catergory/:id",requireSignIn,isAdmin,deleteCategoryController)
export default router;