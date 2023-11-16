import { BigInt } from "@graphprotocol/graph-ts";
import { MetaData } from "../../generated/schema";
import { TOKEN_URI } from "../constants";

export function createMetadata(cloneId: BigInt): MetaData {
  let metadata = new MetaData(cloneId.toString());
  metadata.tokenId = cloneId;
  metadata.tokenUri = `${TOKEN_URI}${cloneId.toString()}`;
  metadata.traits = [];
  metadata.save();

  return metadata as MetaData;
}