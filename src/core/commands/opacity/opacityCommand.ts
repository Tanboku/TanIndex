import { CommandType } from "../../command";
import { useTerminalConfigStore } from "../terminal/config/terminalConfigStore";

const opacityCommand: CommandType = {
  func: "opacity",
  name: "透明度",
  desc: "设置终端背景透明度(0-1)",
  alias: ["alpha", "opa"],
  params: [
    {
      key: "value",
      desc: "透明度值(0-1)",
      required: false,
    },
  ],
  options: [],
  action(options, terminal) {
    const { _ } = options;
    const configStore = useTerminalConfigStore();
    if (_.length < 1) {
      terminal.writeTextResult("当前透明度: " + configStore.opacity);
      terminal.writeTextResult("使用: opacity <0-1小数> 设置背景透明度");
      return;
    }
    const val = parseFloat(_[0]);
    if (isNaN(val) || val < 0 || val > 1) {
      terminal.writeTextErrorResult("透明度必须在 0-1 之间");
      return;
    }
    configStore.setOpacity(val);
    terminal.writeTextSuccessResult("透明度已设置为: " + val);
  },
};

export default opacityCommand;
