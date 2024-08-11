const AWS = require("aws-sdk");

const ses = new AWS.SES({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: "eu-north-1",
});

// const getSendStatistics = () => {
//   // Call the getSendStatistics method
//   ses.getSendStatistics({}, (err, data) => {
//       if (err) {
//           console.error("Error fetching send statistics:", err);
//       } else {
//           console.log("Sending statistics:", data);
//       }
//   });
// }
// getSendStatistics();

async function sendEmail(to, subject, body) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
        Html: {
          Charset: "UTF-8",
          Data: "<html><body><h1>Hello</h1><p>This is a test email sent using Amazon SES!</p></body></html>",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: "contact@visionclara.in", // Replace with your verified email address
    ReplyToAddresses: [],
  };

  return ses.sendEmail(params, (err, data) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent successfully:", data);
    }
  });
}

// sendEmail("krishnakantvish.24@gmail.com", "test 10", "test 10")

module.exports = { sendEmail };
