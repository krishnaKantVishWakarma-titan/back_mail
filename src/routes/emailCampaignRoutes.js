const express = require("express");
const {
  createCampaign,
  getCampaignDetailsById,
  getAllCampaigns,
  deleteCampaignById,
  updateCampaignById,
  scheduleCampaign,
} = require("../controllers/emailCampaignController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", auth, createCampaign);
router.get("/:campaignId", auth, getCampaignDetailsById);
router.get("/", auth, getAllCampaigns);
router.post("/deleteCampaignById", auth, deleteCampaignById);
router.post("/scheduleCampaign", auth, scheduleCampaign);
router.put("/updateCampaignById/:id", auth, updateCampaignById);

module.exports = router;
