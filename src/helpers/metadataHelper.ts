import { BigInt } from "@graphprotocol/graph-ts";
import { Metadata } from "../../generated/schema";
import { TOKEN_URI, STORAGE_URI } from "../constants";
// import { getTrait } from "./getTrait";

export function getOrCreateMetadata(cloneId: BigInt): Metadata {
  let id = cloneId.toString();
  let metadata = Metadata.load(id);
  if (metadata == null) {
    metadata = new Metadata(id);
    metadata.image = TOKEN_URI + "images/" + id + ".png";
    metadata.base64Image = STORAGE_URI + "clone_blur_image/" + id + ".txt";

    metadata.save();
  }

  metadata.save();
  return metadata as Metadata;
}
