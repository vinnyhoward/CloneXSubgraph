import { Transfer as TransferEvent } from "../../generated/CloneX/CloneX";
import { Transfer } from "../../generated/schema";

export function getOrCreateTransfer(event: TransferEvent): Transfer {
  let transferEntity = Transfer.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  if (!transferEntity) {
    transferEntity = new Transfer(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }

  transferEntity.from = event.params.from;
  transferEntity.to = event.params.to;
  transferEntity.tokenId = event.params.tokenId;
  transferEntity.blockNumber = event.block.number;
  transferEntity.blockTimestamp = event.block.timestamp;
  transferEntity.transactionHash = event.transaction.hash;
  transferEntity.gasPrice = event.transaction.gasPrice;

  transferEntity.save();

  return transferEntity as Transfer;
}
