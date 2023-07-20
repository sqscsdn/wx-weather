const { appid, appsecret, template_id, touser, city, key, first_date } = require("./config/index");
const axios = require("axios");
const sendData = {
  touser,
  template_id,
  data: {},
};

async function run() {
  let token = await get_token();
  await update();
  send(token);
}

run();

async function get_token() {
  const {
    data: { access_token },
  } = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`
  );
  return access_token;
}
async function send(token) {
  const res = await axios.post(
    `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
    sendData
  );
  console.log(res.data);
}
async function update() {
  const {
    data: { forecasts },
  } = await axios.get(
    `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${key}&extensions=all`
  );

  // 添加对 forecasts 和 forecasts[0].casts[0] 的合法性检查
  if (forecasts && forecasts.length > 0 && forecasts[0].casts && forecasts[0].casts.length > 0) {
    const forecast = forecasts[0].casts[0];
    const {
      data: { content },
    } = await axios({
      method: "get",
      url: "https://api.uomg.com/api/rand.qinghua",
    });

    let lovedate = parseInt((new Date().getTime() - new Date(first_date).getTime()) / 1000 / 60 / 60 / 24);
    sendData.data = {
      nowDate: {
        value: forecast.date + " 星期" + format(forecast.week),
        color: "#54D7FF",
      },
      city: {
        value: forecasts[0].province + " " + forecasts[0].city,
        color: "#FDF7C4",
      },
      weather: {
        value: forecast.dayweather,
        color: "#E5D225",
      },
      daytemp: {
        value: forecast.daytemp + "°C",
        color: "#2DEDD8",
      },
      nighttemp: {
        value: forecast.nighttemp + "°C",
        color: "#6E64BB",
      },
      loveDate: {
        value: lovedate,
        color: "#E75875",
      },
      text: {
        value: content,
        color: "#E07A70",
      },
    };
  } else {
    // 天气数据可能未获取到，执行适当的错误处理
    console.log("无法获取天气数据");
  }
}

function format(e) {
  switch (e) {
    case "1":
      return "一";
    case "2":
      return "二";
    case "3":
      return "三";
    case "4":
      return "四";
    case "5":
      return "五";
    case "6":
      return "六";
    case "0" || "7":
      return "日";
  }
}
