import {
  cloneMetadata,
  CloneMetadata,
} from "../../assets/metadata/cloneMetadata";
// Currently having issues with AssemblyScript parsing my metadata file.
// So for now I will use a backend to fetch the NFT metadata
export function getTrait(index: number): CloneMetadata | null {
  if (index < cloneMetadata.length) {
    return cloneMetadata[index];
  } else {
    return null;
  }
}
