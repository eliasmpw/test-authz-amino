import { SigningArchwayClient } from "@archwayhq/arch3.js";

import { Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx.js";
import { SendAuthorization } from "cosmjs-types/cosmos/bank/v1beta1/authz.js";

import { aminoTypes } from "./aminoTypes.js";

export const authzSend = async ({
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
      // Permission to send their tokens
      {
        typeUrl: MsgGrant.typeUrl,
        value: MsgGrant.fromPartial({
          granter: walletAddress,
          grantee: granteeAddress,
          grant: {
            authorization: {
              typeUrl: SendAuthorization.typeUrl,
              value: SendAuthorization.encode(
                SendAuthorization.fromPartial({
                  spendLimit: [{ denom: tokenMinDenom, amount: "1" }],
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
