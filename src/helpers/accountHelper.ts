import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";
import { BIGINT_ZERO } from "../constants";

export function getOrCreateAccount(address: Address): Account {
  let id = address as Bytes;
  let account = Account.load(id);

  if (!account) {
    account = new Account(id);
    account.nftCount = BIGINT_ZERO;
    account.ownedTokenIds = new Array<BigInt>();
    account.totalGasSpent = BIGINT_ZERO;
    account.transactions = new Array<Bytes>();
    account.save();
  }

  // initialize fields if they don't exist
  if (!account.totalGasSpent) {
    account.totalGasSpent = BIGINT_ZERO;
  }

  if (!account.nftCount) {
    account.nftCount = BIGINT_ZERO;
  }

  if (!account.ownedTokenIds) {
    account.ownedTokenIds = new Array<BigInt>();
  }

  if (!account.transactions) {
    account.transactions = new Array<Bytes>();
  }

  return account as Account;
}
