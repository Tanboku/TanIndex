import { CommandType } from "../../command";

const weatherCommand: CommandType = {
  func: "weather",
  name: "天气",
  desc: "查询指定城市的天气",
  alias: ["tianqi", "wth"],
  params: [
    {
      key: "city",
      desc: "城市名称(如: 北京)",
      required: false,
    },
  ],
  options: [
    {
      key: "days",
      desc: "预报天数(1-3)",
      alias: ["d"],
      type: "string",
      defaultValue: "1",
    },
  ],
  async action(options, terminal) {
    const { _, days = "1" } = options;
    let city = _.join(" ") || "北京";
    terminal.writeTextResult("正在查询 " + city + " 的天气...");
    try {
      const res = await fetch(
        "https://wttr.in/" + encodeURIComponent(city) + "?format=j1&lang=zh"
      );
      const data = await res.json();
      const current = data.current_condition[0];
      terminal.writeTextSuccessResult(city + " 天气");
      terminal.writeTextResult("温度: " + current.temp_C + "°C");
      terminal.writeTextResult("体感: " + current.FeelsLikeC + "°C");
      terminal.writeTextResult("天气: " + current.weatherDesc[0].value);
      terminal.writeTextResult("湿度: " + current.humidity + "%");
      terminal.writeTextResult("风速: " + current.windspeedKmph + " km/h");
      const dayCount = Math.min(parseInt(days as string) || 1, 3);
      if (dayCount > 1 && data.weather) {
        for (let i = 0; i < Math.min(dayCount, data.weather.length); i++) {
          const day = data.weather[i];
          terminal.writeTextResult(
            day.date + ": " + day.tempMinC + "-" + day.tempMaxC + "°C " + day.hourly[0].weatherDesc[0].value
          );
        }
      }
    } catch {
      terminal.writeTextErrorResult("获取天气失败，请检查城市名或网络连接");
    }
  },
};

export default weatherCommand;
