import { BigInt, Bytes } from "@graphprotocol/graph-ts";
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
  Token,
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let approvalEntity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  approvalEntity.owner = event.params.owner;
  approvalEntity.approved = event.params.approved;
  approvalEntity.tokenId = event.params.tokenId;

  approvalEntity.blockNumber = event.block.number;
  approvalEntity.blockTimestamp = event.block.timestamp;
  approvalEntity.transactionHash = event.transaction.hash;

  approvalEntity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let approveAllEntity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  approveAllEntity.owner = event.params.owner;
  approveAllEntity.operator = event.params.operator;
  approveAllEntity.approved = event.params.approved;

  approveAllEntity.blockNumber = event.block.number;
  approveAllEntity.blockTimestamp = event.block.timestamp;
  approveAllEntity.transactionHash = event.transaction.hash;

  approveAllEntity.save();
}

export function handleCloneXRevealed(event: CloneXRevealedEvent): void {
  let revealEntity = new CloneXRevealed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  const tokenId = event.params.tokenId;
  revealEntity.tokenId = tokenId;
  revealEntity.fileId = event.params.fileId;

  revealEntity.blockNumber = event.block.number;
  revealEntity.blockTimestamp = event.block.timestamp;
  revealEntity.transactionHash = event.transaction.hash;

  revealEntity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let ownershipEntity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  ownershipEntity.previousOwner = event.params.previousOwner;
  ownershipEntity.newOwner = event.params.newOwner;

  ownershipEntity.blockNumber = event.block.number;
  ownershipEntity.blockTimestamp = event.block.timestamp;
  ownershipEntity.transactionHash = event.transaction.hash;

  ownershipEntity.save();
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

  let fromAccountId = event.params.from.toHexString();
  let toAccountId = event.params.to.toHexString();
  let tokenId = event.params.tokenId;

  let fromAccount = Account.load(fromAccountId);
  if (fromAccount == null) {
    fromAccount = new Account(fromAccountId);
    fromAccount.nftCount = BigInt.fromI32(0);
    fromAccount.totalGasSpent = BigInt.fromI32(0);
    fromAccount.transactions = new Array<Bytes>();
    fromAccount.ownedTokenIds = [];
  }

  if (fromAccountId != "0x0000000000000000000000000000000000000000") {
    fromAccount.nftCount = fromAccount.nftCount.minus(BigInt.fromI32(1));

    let tokenIndex = fromAccount.ownedTokenIds.indexOf(tokenId);
    if (tokenIndex > -1) {
      fromAccount.ownedTokenIds.splice(tokenIndex, 1);
    }
  }

  if (!fromAccount.totalGasSpent) {
    fromAccount.totalGasSpent = BigInt.fromI32(0);
  }

  fromAccount.totalGasSpent = fromAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  let fromTransactions = fromAccount.transactions;
  if (!fromTransactions) {
    fromTransactions = new Array<Bytes>();
  }

  fromTransactions.push(event.transaction.hash);
  fromAccount.transactions = fromTransactions;

  let toAccount = Account.load(toAccountId);
  if (toAccount == null) {
    toAccount = new Account(toAccountId);
    toAccount.nftCount = BigInt.fromI32(1);
    toAccount.totalGasSpent = BigInt.fromI32(0);
    toAccount.transactions = new Array<Bytes>();
    toAccount.ownedTokenIds =
      fromAccountId == "0x0000000000000000000000000000000000000000"
        ? [tokenId]
        : [];
  } else {
    if (!toAccount.ownedTokenIds.includes(tokenId)) {
      toAccount.ownedTokenIds.push(tokenId);
    }
    toAccount.nftCount = toAccount.nftCount.plus(BigInt.fromI32(1));
  }

  if (!toAccount.totalGasSpent) {
    toAccount.totalGasSpent = BigInt.fromI32(0);
  }
  toAccount.totalGasSpent = toAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  const tokenEntity = new Token(tokenId.toString());
  tokenEntity.tokenId = tokenId;
  tokenEntity.owner = toAccount.id;

  let toTransactions = toAccount.transactions;

  if (!toTransactions) {
    toTransactions = new Array<Bytes>();
  }

  toTransactions.push(event.transaction.hash);
  toAccount.transactions = toTransactions;

  transferEntity.save();
  fromAccount.save();
  tokenEntity.save();
  toAccount.save();
}
