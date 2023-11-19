import { Bytes } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/CloneX/CloneX";
import { TransferHistory } from "../../generated/schema";

export function getOrCreateTransferHistory(
    event: TransferEvent,
    tokenId: string,
    senderId: Bytes,
    receiverId: Bytes
  ): TransferHistory {
    let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    let historyEntity = TransferHistory.load(id);
  
    if (!historyEntity) {
      historyEntity = new TransferHistory(id);
      historyEntity.token = tokenId; 
      historyEntity.sender = senderId; 
      historyEntity.receiver = receiverId;
      historyEntity.timestamp = event.block.timestamp;
      historyEntity.transactionHash = event.transaction.hash;
      historyEntity.blockNumber = event.block.number;
      historyEntity.gasPrice = event.transaction.gasPrice;
      historyEntity.save();
    }
  
    return historyEntity as TransferHistory;
  }