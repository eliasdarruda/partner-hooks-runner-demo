import { ActorContext, Value, payloadFor } from "@eigr/spawn-sdk";
import {
  HookScriptState,
  Ticket,
  AdditionalPriceResponse,
} from "../protos/hooks";
import vm from "node:vm";
import { runWithTimeout } from "../utils";

export const quoteHookHandler = async (
  ctx: ActorContext<HookScriptState>,
  payload: Ticket
) => {
  console.log("Executing quoteHookHandler script");

  if (!ctx.state.transpiledCode) {
    return Value.of();
  }

  const script = new vm.Script(ctx.state.transpiledCode);
  const context = JSON.parse(ctx.state.jsonContext || "{}");

  try {
    const response = await runWithTimeout<AdditionalPriceResponse>(
      script,
      payload,
      context
    );

    if (response === "timeout") {
      console.log("quoteHookHandler timed out");

      return Value.of<HookScriptState, AdditionalPriceResponse>().response(
        payloadFor(AdditionalPriceResponse, {})
      );
    }

    if (Number.isInteger(response.amount)) {
      response.amount = Number.parseFloat(`${response.amount}`);
    }

    return Value.of<HookScriptState, AdditionalPriceResponse>()
      .state({ ...ctx.state, jsonContext: JSON.stringify(context) })
      .response(payloadFor(AdditionalPriceResponse, response));
  } catch (e) {
    console.log(e);

    return Value.of<HookScriptState, AdditionalPriceResponse>().response(
      payloadFor(AdditionalPriceResponse, {})
    );
  }
};
