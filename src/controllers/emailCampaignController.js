const EmailCampaign = require("../models/emailCampaignModel");
const emailQueue = require("../queue/taskQueue");

exports.createCampaign = async (req, res) => {
  const { campaignName } = req.body;
  const userId = req.user.id;

  let duplicateCampaign;
  try {
    duplicateCampaign = await EmailCampaign.findOne({
      user: userId,
      name: campaignName,
    });

    if (duplicateCampaign) {
      return res.json({ status: 400, msg: "Campaign already exists" });
    }

    const campaign = new EmailCampaign({
      user: userId,
      name: campaignName,
    });
    await campaign.save();

    res.status(200).json({
      status: 200,
      msg: "Campaign Created",
      campaignId: campaign._id,
    });
  } catch (err) {
    console.error(err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "An error occurred." });
    }
  }
};

exports.getCampaignDetailsById = async (req, res) => {
  const userId = req.user.id;
  const campaignId = req.params.campaignId;

  try {
    let campaign = await EmailCampaign.findOne({
      _id: campaignId,
      user: userId,
    });

    if (!campaign) {
      return res.json({ status: 400, msg: "Campaign Not Found" });
    }

    res.status(200).json({
      status: 200,
      msg: "Campaign found",
      data: campaign,
    });
  } catch (err) {
    console.error(err.message);
  }
};

exports.getAllCampaigns = async (req, res) => {
  const userId = req.user.id;

  const { page = 1, limit = 10 } = req.query;

  try {
    let campaignList = await EmailCampaign.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await EmailCampaign.countDocuments({ user: userId });

    console.log(campaignList);

    res.status(200).json({ data: campaignList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteCampaignById = async (req, res) => {
  const { campaignId } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;
  try {
    await EmailCampaign.deleteOne({ _id: campaignId });

    const campaignList = await EmailCampaign.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await EmailCampaign.countDocuments({ user: userId });

    res.status(200).json({ data: campaignList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateCampaignById = async (req, res) => {
  const campaignId = req.params.id;
  const updates = req.body;
  const userId = req.user.id;
  console.log(updates);
  try {
    // Find the campaign and update it
    const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
      { _id: campaignId, user: userId },
      { $set: updates.payload },
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json(updatedCampaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.scheduleCampaign = async (req, res) => {
  const { campaignId } = req.body;
  const userId = req.user.id;
  try {
    const campaign = await EmailCampaign.findOne({
      _id: campaignId,
      user: userId,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await emailQueue.add({ campaign });

    res.status(200).json({ status: 200, msg: "Scheduled" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
