import { ActorContext, Value, payloadFor } from "@eigr/spawn-sdk";
import {
  HookScriptState,
  ActivityPriceOverridePayload,
  ActivityPriceOverrideResponse,
} from "../protos/hooks";
import vm from "node:vm";
import { runWithTimeout } from "../utils";

export const priceOverrideHookHandler = async (
  ctx: ActorContext<HookScriptState>,
  payload: ActivityPriceOverridePayload
) => {
  console.log("Executing priceOverrideHookHandler script");

  if (!ctx.state.transpiledCode) {
    return Value.of();
  }

  const script = new vm.Script(ctx.state.transpiledCode);
  const context = JSON.parse(ctx.state.jsonContext || "{}");

  try {
    const response = await runWithTimeout<ActivityPriceOverrideResponse>(
      script,
      payload,
      context
    );

    if (response === "timeout") {
      console.log("priceOverrideHookHandler timed out");

      return Value.of().response(
        payloadFor(ActivityPriceOverrideResponse, { overrides: [] })
      );
    }

    return Value.of<HookScriptState, ActivityPriceOverrideResponse>()
      .state({ ...ctx.state, jsonContext: JSON.stringify(context) })
      .response(payloadFor(ActivityPriceOverrideResponse, response));
  } catch (e) {
    console.log(e);

    return Value.of<HookScriptState, ActivityPriceOverrideResponse>().response(
      payloadFor(ActivityPriceOverrideResponse, { overrides: [] })
    );
  }
};
