const myHeaders = new Headers();
myHeaders.append("Accept", "*/*");
myHeaders.append("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6");
myHeaders.append("Connection", "keep-alive");
myHeaders.append("Content-Type", "text/xml");
myHeaders.append("Cookie", "ASP.NET_SessionId=yvyp5vbimi3frj55faeopfzn; CookieKey_AdSid=#home; __utma=224756942.1331574156.1718240612.1718240612.1718240612.1; __utmc=224756942; __utmz=224756942.1718240612.1.1.utmcsr=bing|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; UM_distinctid=1900f1f144e17-0211ba77140c4e-4c657b58-190140-1900f1f144f1755; CNZZDATA4012366=cnzz_eid%3D8425536-1718240613-https%253A%252F%252Fwww.en998.com%252F%26ntime%3D1718240613; TestCookie=58373FF06BA7EB5D0C77F6DE7BD4BD823E30C95A1E73B4D99C3F90095DB70AB67B54FC40FDF5B9AC137C364C9BDFFC488C2EFBAF4F933184454264B5CBBEC59423022E1E0ED2337584921E2D45078AF3A68A2BE54F263785D5C8D79C3E66D33FA62FEB423D2900616644FD7C; __utmb=224756942.3.10.1718240612; ckhistory=The quick brown fox jumps over the lazy dog that is sleeping.");
myHeaders.append("Origin", "https://www.en998.com");
myHeaders.append("Referer", "https://www.en998.com/sentence/");
myHeaders.append("Sec-Fetch-Dest", "empty");
myHeaders.append("Sec-Fetch-Mode", "cors");
myHeaders.append("Sec-Fetch-Site", "same-origin");
myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0");
myHeaders.append("X-Requested-With", "XMLHttpRequest");
myHeaders.append("sec-ch-ua", "\"Microsoft Edge\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-platform", "\"Windows\"");

const raw = "##Se2##The quick brown fox jumps over the lazy dog that is sleeping.";

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://www.en998.com/sentence/getsenG.aspx", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));