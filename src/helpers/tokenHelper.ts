import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";

export const getOrCreateToken = (tokenId: BigInt, owner: Bytes): Token => {
    let token = Token.load(tokenId.toString());
    if (token == null) {
        token = new Token(tokenId.toString());
        token.tokenId = tokenId;
        token.owner = owner;
        token.save();
    }

    return token as Token;
}