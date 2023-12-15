import { ActorContext, Value } from "@eigr/spawn-sdk";
import { HookScriptState, RegisterHookScriptRequest } from "../protos/hooks";

const transpiler = new Bun.Transpiler({
  loader: "ts",
});

export const doRegister = async (code: string) => {
  return transpiler.transform(code);
};

export const registerHandler = async (
  ctx: ActorContext<HookScriptState>,
  payload: RegisterHookScriptRequest
) => {
  const transpiledCode = await doRegister(payload.code);

  console.log(transpiledCode);

  return Value.of<HookScriptState>().state({
    jsonContext: ctx.state.jsonContext,
    code: payload.code,
    transpiledCode,
  });
};
