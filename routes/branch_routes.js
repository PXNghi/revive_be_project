const express = require("express");
const branchController = require("../controllers/branch_controller");

const router = express.Router();

router.get("/get-all-branches", branchController.getAllBranches);
router.get("/get-branch-by-id/:id", branchController.getBranchById);
router.post("/create-new-branch", branchController.createNewBranch);
router.put("/update-branch/:id", branchController.updateBranch);
router.delete("/delete-branch/:id", branchController.deleteBranch);
router.get("/get-all-branches-nearby", branchController.getAllBranchesNearby);

module.exports = router;