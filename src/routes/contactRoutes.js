const express = require("express");
const {
  createContact,
  getAllContact,
  deleteContactById,
  importContactsFromCsv,
  editContactById,
  updateIsSubscribeContact,
  getContactsFilteredList,
} = require("../controllers/contactController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", auth, createContact);
router.get("/", auth, getAllContact);
router.post("/deleteContactById", auth, deleteContactById);
router.post("/updateIsSubscribeContact", auth, updateIsSubscribeContact);
router.post("/editById", auth, editContactById);
router.post("/importContactsFromCsv", auth, importContactsFromCsv);
router.post("/getContactsFilteredList", auth, getContactsFilteredList);

module.exports = router;
