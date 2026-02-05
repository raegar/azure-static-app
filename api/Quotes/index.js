const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AzureWebJobsStorage
  );

  const containerClient = blobServiceClient.getContainerClient("quotes");
  const blobClient = containerClient.getBlobClient("quotes.json");

  const downloadResponse = await blobClient.download();
  const downloaded = await streamToString(downloadResponse.readableStreamBody);

  const data = JSON.parse(downloaded);
  const quotes = data.quotes;

  const randomIndex = Math.floor(Math.random() * quotes.length);

  context.res = {
    headers: { "Content-Type": "application/json" },
    body: { quote: quotes[randomIndex] }
  };
};

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}
