import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";

export const getOrCreateToken = (tokenId: BigInt, newOwner: Bytes): Token => {
    let token = Token.load(tokenId.toString());
    if (token == null) {
        token = new Token(tokenId.toString());
        token.tokenId = tokenId;
        token.transferHistory = new Array<string>();
    }

    token.owner = newOwner;
    token.save();
    
    return token as Token;
}