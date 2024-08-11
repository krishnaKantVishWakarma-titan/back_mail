const AWS = require("aws-sdk");

const ses = new AWS.SES({
  region: "eu-north-1", // replace with your region
  accessKeyId: "ASIA5SL377NOWPBVWWMB",
  secretAccessKey: "OIb+oju2kDdoE5hwfsDTKn6It+Lg1JHlrCKqYZfW",
});

async function sendEmail(to, subject, body) {
  console.log("send email:", to, subject, body);
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: "contact@visionclara.in",
  };
  return ses.sendEmail(params).promise();
}

async function sendBulkEmail(emails, subject, body) {
  const params = {
    Source: process.env.SES_EMAIL_SOURCE,
    Template: "YourTemplateName",
    Destinations: emails.map((email) => ({
      Destination: {
        ToAddresses: [email],
      },
      ReplacementTemplateData: JSON.stringify({ subject, body }),
    })),
  };
  return ses.sendBulkTemplatedEmail(params).promise();
}

module.exports = { sendEmail, sendBulkEmail };
