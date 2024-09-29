const Contact = require("../models/contactModel");
const User = require("../models/userModel");

exports.createContact = async (req, res) => {
  const { name, email, tags } = req.body;
  const userId = req.user.id;
  let duplicateContact;
  const page = 1;
  const limit = 10;
  try {
    duplicateContact = await Contact.findOne({
      user: userId,
      email: email,
    });

    if (duplicateContact) {
      return res.json({ status: 400, msg: "Contact already exists" });
    }

    const contact = new Contact({
      user: userId,
      name: name,
      email: email,
      tags: tags,
    });
    await contact.save();

    // Retrieve the paginated list of contacts for the user
    const contactList = await Contact.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get the total count of contacts for pagination purposes
    const total = await Contact.countDocuments({ user: userId });

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          totalNoOfContacts: total,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ data: contactList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllContact = async (req, res) => {
  const userId = req.user.id;

  const { page = 1, limit = 10 } = req.query;

  try {
    let contactList = await Contact.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments({ user: userId });

    console.log(contactList);

    res.status(200).json({ data: contactList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteContactById = async (req, res) => {
  const { contactId } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;
  try {
    await Contact.deleteOne({ _id: contactId });

    const contactList = await Contact.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments({ user: userId });

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          totalNoOfContacts: total,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ data: contactList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateIsSubscribeContact = async (req, res) => {
  const { contactId, subscribedValue } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;
  try {
    const contact = await Contact.findOne({
      user: userId,
      _id: contactId,
    });

    // Correcting the typo in the property name and updating the subscribed value
    contact.subscribed = subscribedValue;
    await contact.save();

    // Retrieve the paginated list of contacts for the user
    const contactList = await Contact.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get the total count of contacts for pagination purposes
    const total = await Contact.countDocuments({ user: userId });

    res.status(200).json({ data: contactList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.editContactById = async (req, res) => {
  const { contactId, name, email, tags } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;

  try {
    // Find the contact by contactId and userId
    const contact = await Contact.findOne({
      user: userId,
      _id: contactId,
    });

    if (!contact) {
      return res.json({ status: 404, msg: "Contact not found" });
    }

    // Check if the email is being updated and if it already exists for the same user
    if (email && email !== contact.email) {
      const emailExists = await Contact.findOne({ email, user: userId });

      if (emailExists) {
        return res.json({ status: 400, msg: "Email already exists" });
      }
    }

    // Update the fields if they are provided in the updatedData
    if (email) contact.email = email;
    if (name) contact.name = name;
    contact.tags = tags;

    // Save the updated contact
    await contact.save();

    // Return the updated contact list for the user
    const contactList = await Contact.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments({ user: userId });

    res.status(200).json({ data: contactList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

async function bulkImportContacts(userId, contacts) {
  try {
    // Filter out contacts with duplicate emails for the same user
    const existingContacts = await Contact.find({
      user: userId,
      email: { $in: contacts.map((contact) => contact.email) },
    }).select("email");

    const existingEmails = existingContacts.map((contact) => contact.email);

    // Filter out contacts that already exist
    const newContacts = contacts.filter(
      (contact) => !existingEmails.includes(contact.email)
    );

    // Add userId to each new contact
    const contactsToInsert = newContacts.map((contact) => ({
      ...contact,
      user: userId,
    }));

    if (contactsToInsert.length > 0) {
      // Insert many contacts with unordered option to continue on duplicates
      const result = await Contact.insertMany(contactsToInsert, {
        ordered: false,
      });

      const total = await Contact.countDocuments({ user: userId });

      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            totalNoOfContacts: total,
          },
        },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        inserted: result,
        skipped: existingContacts,
      };
    }

    return { success: true, inserted: [], skipped: existingContacts };
  } catch (error) {
    if (error.name === "MongoBulkWriteError" && error.code === 11000) {
      console.warn("Duplicate entries detected during bulk import.");
      // Handle duplicates manually
      return {
        success: true,
        inserted: error.result.nInserted,
        skipped: contacts.length - error.result.nInserted,
      };
    } else {
      console.error("Error importing contacts:", error);
      return { success: false, error: error.message };
    }
  }
}

exports.importContactsFromCsv = async (req, res) => {
  const userId = req.user.id;
  const { csvData } = req.body;
  console.log("csvData", csvData);

  try {
    const result = await bulkImportContacts(userId, csvData);
    return res.status(200).json({
      success: true,
      inserted: result.inserted,
      duplicates: result.skipped,
      message: "Imported successfully",
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while importing contacts.",
      });
    }
  }
};

exports.getContactsFilteredList = async (req, res) => {
  const { payload } = req.body;
  const userId = req.user.id;

  try {
    console.log("payload", payload);

    if (payload.option === "sentAll") {
      const totalNoOFContacts = await Contact.countDocuments({ user: userId });
      return res.status(200).json({ total: totalNoOFContacts });
    }

    if (payload.option === "sentTo") {
      const totalContacts = await Contact.countDocuments({
        user: userId,
        tags: {
          $in: payload.tags,
        },
      });
      return res.status(200).json({ total: totalContacts });
    }

    if (payload.option === "dontSentTo") {
      const totalContacts = await Contact.countDocuments({
        user: userId,
        tags: {
          $in: payload.tags,
        },
      });
      return res.status(200).json({ total: totalContacts });
    }

    res.status(200).json({ mess: "no data found" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
