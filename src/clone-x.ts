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
} from "../generated/schema";
import { BIGINT_ONE } from "./constants";
import { getOrCreateAccount } from "./helpers/accountHelper";
import { getOrCreateTransfer } from "./helpers/transferHelper";
import { getOrCreateToken } from "./helpers/tokenHelper";
import { getOrCreateTransferHistory } from "./helpers/transferHistoryHelper";
import { getOrCreateMetadata } from "./helpers/metadataHelper";

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
  // create transfer
  getOrCreateTransfer(event);

  // create accounts
  const fromAccount = getOrCreateAccount(event.params.from);
  const toAccount = getOrCreateAccount(event.params.to);
  const toTransactions = toAccount.transactions;
  const fromTransactions = fromAccount.transactions;

  // create token
  let token = getOrCreateToken(event.params.tokenId, toAccount.id);
  token.owner = toAccount.id;
  let tokenId = token.tokenId;
  
  // create metadata
  let metadata = getOrCreateMetadata(tokenId);
  token.metadata = metadata.id;

  // Update owned tokens for fromAccount
  let fromOwnedTokenIds = fromAccount.ownedTokenIds;
  const fromIndex = fromOwnedTokenIds.indexOf(tokenId);
  if (fromIndex > -1) {
    fromOwnedTokenIds.splice(fromIndex, 1);
  }
  fromAccount.ownedTokenIds = fromOwnedTokenIds;

  // Update owned tokens for toAccount
  let toOwnedTokenIds = toAccount.ownedTokenIds;
  if (toOwnedTokenIds.indexOf(tokenId) === -1) {
    toOwnedTokenIds.push(tokenId);
  }
  toAccount.ownedTokenIds = toOwnedTokenIds;

  // update accounts
  fromAccount.nftCount = fromAccount.nftCount.minus(BIGINT_ONE);
  toAccount.nftCount = toAccount.nftCount.plus(BIGINT_ONE);

  // update gas in accounts
  fromAccount.totalGasSpent = fromAccount.totalGasSpent.plus(
    event.transaction.gasPrice
  );

  // update transactions in accounts (taking assemblyscript's immutable arrays into account)
  fromTransactions.push(event.transaction.hash);
  fromAccount.transactions = fromTransactions;

  toTransactions.push(event.transaction.hash);
  toAccount.transactions = toTransactions;

  // Create or update TransferHistory
  let transferHistoryEntity = getOrCreateTransferHistory(
    event,
    token.id,
    fromAccount.id,
    toAccount.id
  );

  // Update token transfer history
  let tokenHistory = token.transferHistory;
  let updatedTokenHistory = new Array<string>();

  for (let i = 0; i < tokenHistory.length; i++) {
    updatedTokenHistory.push(tokenHistory[i]);
  }

  updatedTokenHistory.push(transferHistoryEntity.id);
  token.transferHistory = updatedTokenHistory;

  metadata.save();
  token.save();
  fromAccount.save();
  toAccount.save();
}
