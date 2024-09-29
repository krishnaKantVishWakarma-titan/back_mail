const Domain = require("../models/domainModel");
const { ses } = require("../../aws_run1");
const { createError } = require("../../utils/errorHandler");

exports.addNewDomainName = async (req, res, next) => {
  const { id: userId } = req.user;
  const { domainName } = req.body.payload;

  try {
    await checkExistingDomain(userId, domainName);
    const verificationToken = await verifyDomainIdentity(domainName);
    const dkimTokens = await verifyDomainDkim(domainName);
    const dnsRecords = createDnsRecords(
      domainName,
      verificationToken,
      dkimTokens
    );

    await saveDomain(userId, domainName, dnsRecords);

    res.status(200).json({ status: 200, message: "Domain added successfully" });
  } catch (error) {
    next(createError(error));
  }
};

async function checkExistingDomain(userId, domainName) {
  const domain = await Domain.findOne({ user: userId, name: domainName });
  if (domain) {
    throw new Error("Domain already exists");
  }
}

async function verifyDomainIdentity(domainName) {
  const { VerificationToken } = await ses
    .verifyDomainIdentity({ Domain: domainName })
    .promise();
  return VerificationToken;
}

async function verifyDomainDkim(domainName) {
  const { DkimTokens } = await ses
    .verifyDomainDkim({ Domain: domainName })
    .promise();
  return DkimTokens;
}

function createDnsRecords(domainName, verificationToken, dkimTokens) {
  return [
    {
      type: "TXT",
      name: `_amazonses.${domainName}`,
      value: verificationToken,
    },
    ...dkimTokens.map((token) => ({
      type: "CNAME",
      name: `${token}._domainkey.${domainName}`,
      value: `${token}.dkim.amazonses.com`,
    })),
  ];
}

async function saveDomain(userId, domainName, dnsRecords) {
  const domain = new Domain({
    name: domainName,
    user: userId,
    dnsRecords,
  });
  await domain.save();
}

exports.getAllDomains = async (req, res) => {
  const userId = req.user.id;

  const { page = 1, limit = 10 } = req.query;

  try {
    let domainList = await Domain.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Domain.countDocuments({ user: userId });

    console.log(domainList);

    res.status(200).json({ data: domainList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getDomainById = async (req, res) => {
  const userId = req.user.id;

  const { domainId } = req.query;

  try {
    const domain = await Domain.findById({ _id: domainId, user: userId });

    if (!domain) {
      return res.status(200).json({ message: "Domain not found", status: 401 });
    }

    res.status(200).json({ domain, status: 200 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteDomainById = async (req, res) => {
  const { domainId } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;
  try {
    const domain = await Domain.findById({ _id: domainId });

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    await ses.deleteIdentity({ Identity: domain.name }).promise();
    await Domain.findByIdAndDelete(domainId);

    const domainList = await Domain.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Domain.countDocuments({ user: userId });

    res.status(200).json({ data: domainList, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
