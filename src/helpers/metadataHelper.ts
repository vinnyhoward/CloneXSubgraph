import { BigInt } from "@graphprotocol/graph-ts";
import { Metadata } from "../../generated/schema";
import { TOKEN_URI } from "../constants";
// import { getTrait } from "./getTrait";

export function getOrCreateMetadata(cloneId: BigInt): Metadata {
  let id = cloneId.toString();
  let metadata = Metadata.load(id);
  if (metadata == null) {
    metadata = new Metadata(id);
    metadata.image = TOKEN_URI + "images/" + id + ".png";
    metadata.save();
  }

  metadata.save();
  return metadata as Metadata;
}