import { SigningArchwayClient } from "@archwayhq/arch3.js";

import { Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx.js";
import {
  AuthorizationType,
  StakeAuthorization,
} from "cosmjs-types/cosmos/staking/v1beta1/authz.js";

import { aminoTypes } from "./aminoTypes.js";

export const authzStake = async ({
  useAmino,
  mnemonics,
  rpcEndpoint,
  granteeAddress,
  tokenMinDenom,
}) => {
  const prefix = "archway";

  const wallet = await (useAmino
    ? Secp256k1HdWallet
    : DirectSecp256k1HdWallet
  ).fromMnemonic(mnemonics, {
    prefix,
  });

  const [{ address: walletAddress }] = await wallet.getAccounts();
  const signingClient = await SigningArchwayClient.connectWithSigner(
    rpcEndpoint,
    wallet,
    { aminoTypes: aminoTypes }
  );
  return await signingClient.signAndBroadcast(
    walletAddress,
    [
      // Permission to stake their tokens
      {
        typeUrl: MsgGrant.typeUrl,
        value: MsgGrant.fromPartial({
          granter: walletAddress,
          grantee: granteeAddress,
          grant: {
            authorization: {
              typeUrl: StakeAuthorization.typeUrl,
              value: StakeAuthorization.encode(
                StakeAuthorization.fromPartial({
                  authorizationType:
                    AuthorizationType.AUTHORIZATION_TYPE_DELEGATE,
                })
              ).finish(),
            },
            expiration: undefined,
          },
        }),
      },
    ],
    {
      amount: [{ denom: tokenMinDenom, amount: "30000000000000000" }],
      gas: "150000",
    },
    "Testing Authz StakeAuthorization Direct"
  );
};
