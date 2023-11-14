import { metadata, Traits } from "../../assets/data/metadata.js";

export function getTrait(index: number): Traits | null {
  if (index < metadata.length) {
    return metadata[index].attributes;
  } else {
    return null;
  }
}
