import { BigInt } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  CloneXRevealed as CloneXRevealedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/CloneX/CloneX";
import {
  Approval,
  ApprovalForAll,
  CloneXRevealed,
  OwnershipTransferred,
  Transfer,
  Account,
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCloneXRevealed(event: CloneXRevealedEvent): void {
  let entity = new CloneXRevealed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.fileId = event.params.fileId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {

  // transfer
  const transferEntity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transferEntity.from = event.params.from;
  transferEntity.to = event.params.to;
  transferEntity.tokenId = event.params.tokenId;
  transferEntity.blockNumber = event.block.number;
  transferEntity.blockTimestamp = event.block.timestamp;
  transferEntity.transactionHash = event.transaction.hash;
  transferEntity.gasPrice = event.transaction.gasPrice;
  transferEntity.save();
  
  let fromAccountId = event.params.from;
  let toAccountId = event.params.to;

  let fromAccount = Account.load(fromAccountId);
  if (fromAccount == null) {
    fromAccount = new Account(fromAccountId);
    fromAccount.nftCount = 0;
    fromAccount.totalGasSpent = BigInt.fromI32(0);
    fromAccount.transactions = new Array<string>();
  }
  if (fromAccountId.toHex() != "0x0000000000000000000000000000000000000000") {
    fromAccount.nftCount -= 1;
  }

  if (!fromAccount.totalGasSpent) {
    fromAccount.totalGasSpent = BigInt.fromI32(0);
  }

  fromAccount.totalGasSpent = fromAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  let fromTransactions = fromAccount.transactions;
  if (!fromTransactions) {
    fromTransactions = new Array<string>();
  }
  fromTransactions.push(event.transaction.hash.toHex());
  fromAccount.transactions = fromTransactions;
  fromAccount.save();

  let toAccount = Account.load(toAccountId);
  if (toAccount == null) {
    toAccount = new Account(toAccountId);
    toAccount.nftCount = 0;
    toAccount.totalGasSpent = BigInt.fromI32(0);
    toAccount.transactions = new Array<string>();
  }
  toAccount.nftCount += 1;

  if (!toAccount.totalGasSpent) {
    toAccount.totalGasSpent = BigInt.fromI32(0);
  }
  toAccount.totalGasSpent = toAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  let toTransactions = toAccount.transactions;
  if (!toTransactions) {
    toTransactions = new Array<string>();
  }
  toTransactions.push(event.transaction.hash.toHex());
  toAccount.transactions = toTransactions;
  toAccount.save();
}
