const express = require("express");
const {
  addNewDomainName,
  getAllDomains,
  deleteDomainById,
  getDomainById,
} = require("../controllers/domainController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/addNewDomainName", auth, addNewDomainName);
router.post("/deleteDomainById", auth, deleteDomainById);
router.get("/", auth, getAllDomains);
router.get("/getDomainById", auth, getDomainById);

module.exports = router;
