import spawn, { Kind } from "@eigr/spawn-sdk";
import {
  HookScriptState,
  ActivityPriceOverridePayload,
  RegisterHookScriptRequest,
  Ticket,
} from "./src/protos/hooks";
import { registerHandler } from "./src/hook_script/register_script";
import { priceOverrideHookHandler } from "./src/hook_script/price_override_hook_handler";
import { quoteHookHandler } from "./src/hook_script/quote_hook_handler";
import { initHandler } from "./src/hook_script/init";

const system = spawn.createSystem("hooks");

const actor = system.buildActor({
  name: "hook_script_actor",
  kind: Kind.UNNAMED,
  stateType: HookScriptState,
  stateful: true,
  snapshotTimeout: 25_000n,
  deactivatedTimeout: 30_000n,
});

actor.addAction({ name: "init" }, initHandler);

actor.addAction(
  { name: "register", payloadType: RegisterHookScriptRequest },
  registerHandler
);

actor.addAction(
  { name: "execute", payloadType: ActivityPriceOverridePayload },
  priceOverrideHookHandler
);

actor.addAction(
  { name: "execute_quote_hook", payloadType: Ticket },
  quoteHookHandler
);

system.register().then(() => console.log("[SpawnSystem] Actors registered"));
