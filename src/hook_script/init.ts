import { ActorContext, Value } from "@eigr/spawn-sdk";
import { HookScriptState } from "../protos/hooks";
import { doRegister } from "./register_script";

const defaultPriceOverrideCode = `
/**
 * This enables you to modify the pricing of a booking.
 * 
 * The context will be persisted cross functions, you can set any value you want
 */
async function execute (payload: ActivityPriceOverridePayload, context: { [key: string]: any }): Promise<ActivityPriceOverrideResponse> {
  // your code here
}
`.trim();

const defaultQuoteParamsCode = `
/**
 * This enables you to add a additional price to a booking or a discount if negative.
 * 
 * The context will be persisted cross functions, you can set any value you want
 */
async function execute (payload: Ticket, context: { [key: string]: any }): Promise<AdditionalPriceResponse> {
  // your code here
}
`.trim();

export const initHandler = async (ctx: ActorContext<HookScriptState>) => {
  console.log(`Hook init ${ctx.self.name}`);

  if (
    !ctx.state.transpiledCode &&
    ctx.self.name.indexOf("pricing_overrides") > -1
  ) {
    const transpiledCode = await doRegister(defaultPriceOverrideCode);

    return Value.of<HookScriptState>().state({
      ...ctx.state,
      code: defaultPriceOverrideCode,
      transpiledCode,
    });
  }

  if (!ctx.state.transpiledCode && ctx.self.name.indexOf("quote_params") > -1) {
    const transpiledCode = await doRegister(defaultQuoteParamsCode);

    return Value.of<HookScriptState>().state({
      ...ctx.state,
      code: defaultQuoteParamsCode,
      transpiledCode,
    });
  }

  return Value.of();
};
