import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { AminoTypes, createDefaultAminoConverters } from "@cosmjs/stargate";

import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx.js";
import { SendAuthorization } from "cosmjs-types/cosmos/bank/v1beta1/authz.js";
import {
  authorizationTypeFromJSON,
  StakeAuthorization,
} from "cosmjs-types/cosmos/staking/v1beta1/authz.js";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp.js";

export const aminoTypes = new AminoTypes({
  ...createDefaultAminoConverters(),
  ...createWasmAminoConverters(),
  ...{
    "/cosmos.authz.v1beta1.MsgGrant": {
      aminoType: "cosmos-sdk/MsgGrant",
      toAmino: ({ granter, grantee, grant }) => {
        if (!grant || !grant.authorization) {
          throw new Error(
            `Unsupported grant type: '${grant?.authorization?.typeUrl}'`
          );
        }
        let authorizationValue;
        switch (grant?.authorization?.typeUrl) {
          case "/cosmos.bank.v1beta1.SendAuthorization": {
            const spend = SendAuthorization.decode(grant.authorization.value);
            authorizationValue = {
              type: "cosmos-sdk/SendAuthorization",
              value: {
                spend_limit: spend.spendLimit,
              },
            };
            break;
          }
          case "/cosmos.staking.v1beta1.StakeAuthorization": {
            const stake = StakeAuthorization.decode(grant.authorization.value);
            authorizationValue = {
              type: "cosmos-sdk/StakeAuthorization",
              value: {
                authorization_type: stake.authorizationType,
              },
            };
            break;
          }
          default:
            throw new Error(
              `Unsupported grant type: '${grant.authorization.typeUrl}'`
            );
        }
        const expiration = grant.expiration?.seconds;
        return {
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: expiration
              ? new Date(Number(expiration) * 1000)
                  .toISOString()
                  .replace(/\.000Z$/, "Z")
              : undefined,
          },
        };
      },
      fromAmino: ({ granter, grantee, grant }) => {
        const authorizationType = grant?.authorization?.type;
        let authorizationValue;
        switch (authorizationType) {
          case "cosmos-sdk/SendAuthorization": {
            authorizationValue = {
              typeUrl: "/cosmos.bank.v1beta1.SendAuthorization",
              value: SendAuthorization.encode(
                SendAuthorization.fromPartial({
                  spendLimit: grant.authorization.value.spend_limit,
                })
              ).finish(),
            };
            break;
          }
          case "cosmos-sdk/StakeAuthorization": {
            authorizationValue = {
              typeUrl: "/cosmos.staking.v1beta1.StakeAuthorization",
              value: StakeAuthorization.encode(
                StakeAuthorization.fromPartial({
                  authorizationType: authorizationTypeFromJSON(
                    grant.authorization.value.authorization_type
                  ),
                })
              ).finish(),
            };
            break;
          }
          default:
            throw new Error(
              `Unsupported grant type: '${grant?.authorization?.type}'`
            );
        }
        const expiration = grant.expiration
          ? Date.parse(grant.expiration)
          : undefined;
        return MsgGrant.fromPartial({
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: expiration
              ? Timestamp.fromPartial({
                  seconds: BigInt(expiration / 1000),
                  nanos: (expiration % 1000) * 1e6,
                })
              : undefined,
          },
        });
      },
    },
  },
});
