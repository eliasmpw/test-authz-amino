import { authzSend } from "./src/authzSend.js";
import { authzStake } from "./src/authzStake.js";

// Variables
const mnemonics = "any..."; // Replace with yours, make sure it is a burner or testing wallet
const rpcEndpoint = "https://rpc.constantine.archway.io";
const granteeAddress =
  "archway1p780esyu7j4tcvc62c0ra2y042nc4mcalfetyh250h2tpz4x67wqaul9h9"; // Replace with any address, this default is the autocompounding contract on constantine
const tokenMinDenom = "aconst";
const prefix = "archway";

// Execution
console.log(
  "- Creating Authz MsgGrant -> \u001b[32mSend\u001b[0mAuthorization with \u001b[32mDIRECT\u001b[0m Signer..."
);
const authzSendDirect = await authzSend({
  useAmino: false,
  mnemonics,
  rpcEndpoint,
  granteeAddress,
  tokenMinDenom,
  prefix,
});
console.log(
  `\u001b[32m✔ SUCCESS\u001b[0m with tx ${authzSendDirect.transactionHash}\n`
);
// -------------
console.log(
  "- Creating Authz MsgGrant -> \u001b[32mStake\u001b[0mAuthorization with \u001b[32mDIRECT\u001b[0m Signer..."
);
const authzStakeDirect = await authzStake({
  useAmino: false,
  mnemonics,
  rpcEndpoint,
  granteeAddress,
  tokenMinDenom,
  prefix,
});
console.log(
  `\u001b[32m✔ SUCCESS\u001b[0m with tx ${authzStakeDirect.transactionHash}\n`
);
// -------------
console.log(
  "- Creating Authz MsgGrant -> \u001b[32mSend\u001b[0mAuthorization with \u001b[32mAMINO\u001b[0m Signer..."
);
const authzSendAmino = await authzSend({
  useAmino: true,
  mnemonics,
  rpcEndpoint,
  granteeAddress,
  tokenMinDenom,
  prefix,
});
console.log(
  `\u001b[32m✔ SUCCESS\u001b[0m with tx ${authzSendAmino.transactionHash}\n`
);
// -------------
console.log(
  "- Creating Authz MsgGrant -> \u001b[32mStake\u001b[0mAuthorization with \u001b[32mAMINO\u001b[0m Signer..."
);
const authzStakeAmino = await authzStake({
  useAmino: true,
  mnemonics,
  rpcEndpoint,
  granteeAddress,
  tokenMinDenom,
  prefix,
});
console.log(
  `\u001b[32m✔ SUCCESS\u001b[0m with tx ${authzStakeAmino.transactionHash}\n`
);
