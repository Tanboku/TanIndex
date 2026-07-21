import { CommandType } from "../../command";

const ipCommand: CommandType = {
  func: "ip",
  name: "IP地址",
  desc: "查看本机公网IP地址",
  alias: ["myip", "publicip"],
  options: [
    {
      key: "all",
      desc: "显示详细信息",
      alias: ["a"],
      type: "boolean",
      defaultValue: false,
    },
  ],
  async action(options, terminal) {
    try {
      terminal.writeTextResult("正在获取IP信息...");
      const res = await fetch("https://ip-api.com/json/?lang=zh-CN");
      const data = await res.json();
      if (options.all) {
        terminal.writeTextSuccessResult("IP地址: " + data.query);
        terminal.writeTextResult("国家: " + data.country);
        terminal.writeTextResult("城市: " + data.city);
        terminal.writeTextResult("ISP: " + data.isp);
        terminal.writeTextResult("组织: " + data.org);
      } else {
        terminal.writeTextSuccessResult("本机公网IP: " + data.query);
        terminal.writeTextResult("位置: " + data.country + " - " + data.city);
        terminal.writeTextResult("运营商: " + data.isp);
      }
    } catch {
      terminal.writeTextErrorResult("获取IP信息失败，请检查网络连接");
    }
  },
};

export default ipCommand;
