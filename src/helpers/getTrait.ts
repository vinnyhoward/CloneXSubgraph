import { metadata } from "../../assets/data/metadata";


export function getTrait(index: i32): any[] | null {
  if (index < metadata.length) {
    return metadata[index];
  } else {
    return null;
  }
}
