"use strict"
import {MD5} from "./utils.js";
// import axios from "axios";
// 基本工具函数 无需修改---begin

// 转换{b:{index: 0, times: 1}} 为 [{index: 0, word: b, times: 1}]
function object2array(newWords) {
    let arrWords = []
    for(let word in newWords) {
        let item = newWords[word];
        arrWords.push({index: item["index"], word, times: item["times"], trans: item["trans"]})
    }
    // 在这里排序
    if(config['deal_type'] == 'times') {
        arrWords = arrWords.sort(function(a,b){
            return b[config['deal_type']] - a[config['deal_type']]
        });
    } else {
        arrWords = arrWords.sort(function(a,b){
            return a[config['deal_type']] - b[config['deal_type']]
        });
    }
    return arrWords;
}



// 复制的方法
function copyText(text, callback){ // text: 要复制的内容， callback: 回调
    var tag = document.createElement('textarea');
    tag.setAttribute('id', 'cp_hgz_input');
    tag.value = text;
    document.getElementsByTagName('body')[0].appendChild(tag);
    document.getElementById('cp_hgz_input').select();
    document.execCommand('copy');
    document.getElementById('cp_hgz_input').remove();
    if(callback) {callback(text)}
}

// 提取文章中的所有单词
// return [a, a, b, c]
export function findWords(text) {
    return text.match(/\b[a-zA-Z]+\b/g);
}

// 单词统计-处理单词列表
// 输入 [b, a, a, c]
// return {b:{index: 0, times: 1}}
export function wordsDeal(words, exWords=[]) {
    // let exWords = findWords(exclude_words);
    // exWords = exWords ? exWords : []
    let newWords = {}
    for(let i = 0; i < words.length; i++) {
        // 单词预处理
        if(!ky_words_map[words[i]] && ky_words_map[words[i].toLowerCase()]) { // 这个单词不存在，但是小写存在，直接替换
            words[i] = words[i].toLowerCase()
        } else {
            // 去除末尾s还存在
            if(words[i].substring(words[i].length - 1) == 's' && ky_words_map[words[i].toLowerCase().substring(0, words[i].length - 1)]) {
                words[i] = words[i].toLowerCase().substring(0, words[i].length - 1)
            }
        }

        // if(exWords.indexOf(words[i]) != -1) {
        //     continue; // 这个单词被排除了，直接跳过
        // }

        let trans = '';
        if(ky_words_map[words[i]]) { // 如果本地有单词，给单词添加翻译
            trans = ky_words_map[words[i]]['trans']
        }
        // } else { // 本地没有单词信息
        //     fanyi(words[i], i)
        // }
        //
        if(newWords[words[i]]) { // 如果单词存在，那么统计次数
            newWords[words[i]]["times"]++;
        } else { // 不存在，则创建单词
            newWords[words[i]] = {index: i, times : 1, trans};
        }
    }
    return newWords;
}

export async function translateWord(word) {
    var appid = '20200424000428689'; // 百度翻译 API 的 appid
    var key = 'drJp2hpTuTmt7Jn0yi_O'; // API 密钥
    var salt = new Date().getTime(); // 时间戳，用作盐值
    var from = 'en'; // 源语言
    var to = 'zh'; // 目标语言

    // 生成签名
    var str1 = appid + word + salt + key;
    var sign = MD5(str1);

    try {
        // 发起翻译请求
        const response = await axios.get('https://api.fanyi.baidu.com/api/trans/vip/translate', {
            params: {
                q: word,
                appid: appid,
                salt: salt,
                from: from,
                to: to,
                sign: sign
            }
        });

        // 获取翻译结果
        const data = response.data;
        if (data['trans_result']) {
            return data['trans_result'][0]['dst']; // 返回翻译的结果
        } else {
            throw new Error("翻译失败，没有获得结果");
        }

    } catch (error) {
        console.error("请求翻译时出错", error);
        throw error; // 继续抛出异常
    }
}

// 基本工具函数---end

function fanyi(word, time) {

    setTimeout(function () {
        var appid = '20200424000428689';
        var key = 'drJp2hpTuTmt7Jn0yi_O';
        var salt = (new Date).getTime();
        var query = word;
        // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
        var from = 'en';
        var to = 'zh';
        var str1 = appid + query + salt +key;
        var sign = MD5(str1);
        $.ajax({
            url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
            type: 'get',
            dataType: 'jsonp',
            data: {
                q: query,
                appid: appid,
                salt: salt,
                from: from,
                to: to,
                sign: sign
            },
            success: function (data) {
                if(data['trans_result']) {
                    $("#" + query + "_trans").html(data['trans_result'][0]['dst'])
                    // console.log($("#" + query + "_trans").html());
                } else {
                    fanyi(query, 1000)
                }

                // $("#" + query + "_trans").val("aa")
                // console.log("执行了", "#" + query + "_trans")

            }
        });
    }, (50 * time) % 10000 )

}

let current_words_map = {}  // 查询到的单词信息 {b:{index: 0, times: 1}, a: {index: 1, times: 1}}
let ky_words_map = new Object();
let exclude_words = "" // 排除的单词信息
let config = {} // 设置信息
let data = {lean_word_total: 0, lean_word_easy: 0, lean_word_show: 0} // 显示数据

// 刚开始滚动条滚动，这个div随着滚动条滚动。当div的边缘碰到顶部的时候，div就不随滚动条滚动了，而是一直静止在那里。
function isdh(ee)
{

    var divh=$(ee).offset().top;

    $(window).scroll(function(){

        var wsh=$(window).scrollTop();
        let w = $(window).width();
        //  console.log(wsh, divh)
        let width = $(ee).width()
        if (wsh + 56 >=divh && w > 720)

        {

            $(ee).css({"position":"fixed","top":"0px", "width": width});}
        else
        {
            $(ee).removeAttr('style')
            $(ee).css({"position":"relative","top":"0px", "width": width});}

    })

}

// 入口函数
// $(document).ready(function() {
//
// })



// 保存一些必要的信息
function save() {
    localStorage.setItem('config', JSON.stringify(config));
    saveExclude();
}

// 保存需要排除的单词
function saveExclude() {
    exclude_words = $("#input-exclude").val()
    localStorage.setItem("exclude_words", exclude_words);

}

// 排除单词
function dealExclude() {

}

function copy() {
    let format = $("#copy-format").val();
    config['copy_format'] = format;
    save();
    let str = "";
    let words = object2array(current_words_map);
    for(let word of words) {
        let s = format.replace('[word]', word['word']);
        s = s.replace('[trans]', word['trans'])
        s = s.replace('[times]', word['times'])
        s = s.replace('\\n', '\n')
        str += s;
    }
    copyText(str, alert('复制成功'))
}

// 处理文章函数
function deal(type) {
    initData();
    config['deal_type'] = type;
    save();
    let text = $("#input-article").val(); // 获取文章
    if(!text) {
        alert("请输入文章内容")
    }
    let words_list = findWords(text); // 提取单词数组 [apple, a, c]
    current_words_map = wordsDeal(words_list); // 处理单词数组为 {b:{index: 0, times: 1}, a: {index: 1, times: 1}}

    show();
}


// 获取考研单词
// function get_ky() {
//     $.get("./words.txt", function (data, status) {
//         // console.log("请求网络")
//         let datalist = data.split("\n");
//         let ky_words = {}
//         for (let i = 0; i < datalist.length; i++) {
//             // console.log(datalist[i].split(" ")[1]);
//             let wordObj = datalist[i].split(" ");
//             let word = wordObj[1]
//             let trans = "";
//             for(let i = 2; i < wordObj.length; i++) {
//                 trans += wordObj[i];
//             }
//             // console.log(ky_words_map[word])
//             if(word) {
//                 ky_words[word] = {word, trans};
//             }
//
//         }
//         ky_words_map = ky_words
//         localStorage.setItem("ky_words_map", JSON.stringify(ky_words_map) );
//     })
// }

export function get_ky() {
    ky_words_map = JSON.parse(localStorage.getItem('ky_words_map') || '{}')
    if(Object.keys(ky_words_map).length !== 0) {
        console.log("本地词库加载", ky_words_map)
        return
    }
    axios.get("./words.txt").then(function (response) {
        // console.log("请求网络")
        let data = response.data;
        let datalist = data.split("\n");
        let ky_words = {};
        for (let i = 0; i < datalist.length; i++) {
            // console.log(datalist[i].split(" ")[1]);
            let wordObj = datalist[i].split(" ");
            let word = wordObj[1];
            let trans = "";
            for (let j = 2; j < wordObj.length; j++) {
                trans += wordObj[j] + (j < wordObj.length - 1 ? " " : ""); // Add spaces between parts of the translation, except after the last part
            }
            // console.log(ky_words_map[word])
            if (word) {
                ky_words[word] = { word, trans };
            }
        }
        ky_words_map = ky_words;
        localStorage.setItem("ky_words_map", JSON.stringify(ky_words_map));
    }).catch(function (error) {
        console.error('Error fetching the words:', error);
    });
}



// 刷新显示
function show() {
    showTable(); // 刷新查询的单词列表
    // console.log()
    $('#copy-format').val(config['copy_format']);
    $('#input-exclude').val(exclude_words);
}





// 在table中显示信息
function showTable() {
    // let word = [{"id": 1,"word":"apple", "times": 2},{"id": 2, "word":"the", "times": 2}];
    let words = object2array(current_words_map);
    let innter = "";


    for(let item of words) {
        // console.log(item);
        innter += `<tr>
        <td>${item["index"]}</td>
        <td><span onclick="play('${item["word"]}')" class="word">${item["word"]}</span></td>
        <td>${item["times"]}</td>
        <td><span class="trans trans-hide" id="${item["word"]}_trans" onclick="changecolor(this,'${item["word"]}')">${item["trans"]}<span></td>
       
        </tr>`
    }
    //  <td><button type="button" class="btn btn-info btn-sm" onclick="easy(this,'${item["word"]}')">认识</button></td>
    data.lean_word_total = words.length
    initData();
    $("#msg").html(`不重复单词数量：${data.lean_word_total}`)

    showData()
    $("#table-content").html(innter);
}

// 认识单词
function easy(This, word) {
    data.lean_word_easy++;
    showData()
    $(This).parent().parent().hide(); // 隐藏认识的单词
    exclude_words = exclude_words + ' ' + word; // 在排除列表中添加
    $('#input-exclude').val(exclude_words); // 刷新排除单词的textarea框
    save(); // 保存到localstore
}

// 刷新data中的数据
function showData() {
    $('#lean_word_total').html(data.lean_word_total);
    $('#lean_word_easy').html(data.lean_word_easy);
    $('#lean_word_show').html(data.lean_word_show);

    $('#lean_word_easy_progress').attr('style', 'width: '+ (data.lean_word_easy / data.lean_word_total) * 100 +'%')
    $('#lean_word_easy_progress').attr('aria-valuemax', data.lean_word_total)
    $('#lean_word_easy_progress').attr('aria-valuenow', data.lean_word_easy)

    $('#lean_word_show_progress').attr('style', 'width: '+ ((data.lean_word_show - data.lean_word_easy) / data.lean_word_total) * 100 +'%')
    $('#lean_word_show_progress').attr('aria-valuemax', data.lean_word_total)
    $('#lean_word_show_progress').attr('aria-valuenow', data.lean_word_show - data.lean_word_easy)
}

function initData() {
    data.lean_word_easy = 0
    // data.lean_word_total = 0
    data.lean_word_show = 0
}

// 改变翻译的颜色
function changecolor(This, word) {
    if($(This).hasClass('trans-hide')) {
        play(word);
        data.lean_word_show++;
        $(This).removeClass('trans-hide');
    } else {
        easy(This, word); // 没有遮挡，再次点击标记认识
    }
    showData();

}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

// 查单词
function searchWord() {
    let word = $("#searchWordInput").val();

    var appid = '20200424000428689';
    var key = 'drJp2hpTuTmt7Jn0yi_O';
    var salt = (new Date).getTime();
    var query = word;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'en';
    var to = 'zh';
    var str1 = appid + query + salt +key;
    var sign = MD5(str1);
    $.ajax({
        url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
            if(data['trans_result']) {
                $("#searchWordShow").html(data['trans_result'][0]['dst']);
            } else {
                $("#searchWordShow").html('没找到');
            }
            $("#searchWordInput").val();
        }
    });




}

// 播放声音
function play(text) {
    var voice = document.getElementById('voice'); //获取到audio元素
    voice.src = 'http://dict.youdao.com/dictvoice?type=0&audio=' + text;
    if (voice.paused) { //判断音乐是否在播放中，暂停状态
        voice.play(); //音乐播放
    } else { //播放状态
        voice.pause(); //音乐停止
    }
}

function bigSize() {
    $(".word").css("font-size", "30px");
}
