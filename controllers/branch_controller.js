const Branch = require("../models/branch_model");

exports.getAllBranches = async (req, res) => {
	try {
		const branches = await Branch.find();
		return res.status(201).json({ success: true, data: branches });
	} catch (error) {
		console.log("Error getAllBranches: ", error);
		return res
			.status(400)
			.json({ success: false, message: "Internal server error" });
	}
};

// get branch by id
exports.getBranchById = async (req, res) => {
	try {
		const { id } = req.params;
		const branch = await Branch.findById(id);
		if (branch) {
			return res.status(201).json({ success: true, data: branch });
		} else {
			return res
				.status(404)
				.json({ success: false, message: "Branch not found" });
		}
	} catch (error) {
		console.log("Error getBranchById: ", error);
		return res
			.status(400)
			.json({ success: false, message: "Internal server error" });
	}
};

exports.createNewBranch = async (req, res) => {
	try {
		const { district, address, location } = req.body;
		const newBranch = await Branch.create({ district, address, location });
		return res.status(201).json({ success: true, data: newBranch });
	} catch (error) {
		console.log("Error createNewBranch: ", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

exports.updateBranch = async (req, res) => {
	try {
		const updated = await Branch.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true }
		);

		if (!updated)
			return res
				.status(404)
				.json({ success: false, message: "Branch not found" });
		res.status(200).json({
			success: true,
			message: "Branch updated successfully",
			data: updated,
		});
	} catch (error) {
		console.log("Error updateBranch: ", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

exports.deleteBranch = async (req, res) => {
	try {
		const deleted = await Branch.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: "Not found" });
		res.status(201).json({
			success: true,
			message: "Deleted successfully",
		});
	} catch (error) {
		console.log("Error deleteBranch: ", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};
