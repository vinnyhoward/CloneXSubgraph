const fs = require("fs");
const axios = require("axios");

const BASE_URL = "https://clonex-assets.rtfkt.com/";
const TOTAL_NFTS = 20000;
const BATCH_SIZE = 100;

async function fetchNFTMetadata(id) {
  try {
    const response = await axios.get(`${BASE_URL}${id}`);
    const metadata = response.data;
    const imageUrl = metadata.image;
    const name = metadata.name;
    const attributes = metadata.attributes;
    // The token id on chain is different from the actual name.
    // Don't ask me why, ask the devs of the project
    const realTokenId = imageUrl.match(/\/images\/(\d+)\.png/)[1];
    const data = {
      tokenId: Number(realTokenId),
      name: name,
      attributes
    };
    console.log("fetched nft metadata:", data);
    return data;
  } catch (error) {
    console.error(`Error fetching data for token ID ${id}:`, error);
    return null;
  }
}

async function fetchAllNFTs() {
  let nfts = [];
  for (let i = 0; i < TOTAL_NFTS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < i + BATCH_SIZE && j < TOTAL_NFTS; j++) {
      batch.push(fetchNFTMetadata(j));
    }
    const results = await Promise.all(batch);
    nfts = nfts.concat(results.filter((nft) => nft !== null));
  }
  return nfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
}

fetchAllNFTs()
  .then((nfts) => {
    fs.writeFileSync(
      "assets/metadata/nfts.json",
      JSON.stringify(nfts, null, 2)
    );
    console.log("NFT metadata has been saved to nfts.json");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
