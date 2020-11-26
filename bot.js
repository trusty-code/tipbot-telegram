process.env["NTBA_FIX_319"] = 1;
require('dotenv').config()

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Iota = require('@iota/core');
const Telegraf = require('telegraf');
const trustify = require('@trustify/tipbot.ts');
var TinyURL = require('tinyurl');
const Telegram = require('telegraf/telegram')


const BOT_TOKEN = process.env.BOT_TOKEN
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_URL = process.env.DB_URL
const DB_PORT = process.env.DB_PORT
const DB_NAME = process.env.DB_NAME


const bot = new Telegraf(BOT_TOKEN)
const telegram = new Telegram(BOT_TOKEN, {})



trustify.setDB(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_URL}:${DB_PORT}/${DB_NAME}`)


bot.start((ctx) =>
   ctx.reply('Hi! I\'m the IOTA TipBot! \r\nType /help to see a list of available commands. First you ned to set a valid donation adress with /add followed by your address.'))

bot.help((ctx) =>
   ctx.reply('/help - some useful tips to this bot \r\n/add - set your IOTA receiving address \r\n/tip - tip to a User'))

bot.command('add', async (ctx) => {
   let user = ctx.message.from.username
   let address = ctx.message.text.slice(5)
   let response = trustify.add(user, address)
   return ctx.reply(response)
})


bot.command('tip', async (ctx) => {
   if(!ctx.message.entities[1]) {
      ctx.reply("Usage with /tip @username")
      return
   }
   if(!ctx.message.entities[1].type == "mention") {
      ctx.reply("Usage with /tip @user_name")
      return
   }
   // Example text: '/tip @Neupi'
   let text = ctx.message.text
   let offset = ctx.message.entities[1].offset
   let length = ctx.message.entities[1].length
   
   // offset + 1 removes the "@"
   var user = text.substring(offset + 1, offset + length);
   console.log("user", user)

   trustify.tip(user).then((response) => {
      console.log("ctx.message.from", ctx.message)
      if (response) {

         TinyURL.shorten(`iota://${response}/$amout=1&message=Trustify_tip`).then(function (res) {
            ctx.reply(`<b>Tip to ${user}:</b>`,Extra.HTML())
            setTimeout(() =>  {
            ctx.reply(`${response}`, Extra.HTML().markup((m) =>
            m.inlineKeyboard([
               m.callbackButton('Show QR Code', 'send_qr_code'),
               m.urlButton('Trinity', res),
            ])))},100);

         // ctx.reply(`${response}`)

         }, function (err) {
            ctx.reply(err)
         })
       

         
      } else {
         ctx.reply(`@${user} didn't provide a IOTA address.`)
      }
   })
})

bot.action("send_qr_code", (ctx) => {

   // this only works, because on the text is just the address
   let address = ctx.update.callback_query.message.text

   let user_id = ctx.update.callback_query.from.id

   telegram.sendPhoto(user_id, `https://api.qrserver.com/v1/create-qr-code/?data=${address.substring(0,22)}`, {caption: `${address}`}).then(res =>  {
      console.log("sendMessage", res)
   })
   
   return ctx.answerCbQuery(`send_qr_code`)
})




bot.on('sticker', (ctx) =>
   ctx.reply('👍'))

bot.on('mention', (ctx) =>
   ctx.reply('👍'))

//Greetings/////////////////

bot.hears('hi', (ctx) =>
   ctx.reply('Hey there'))
bot.hears('Hi', (ctx) =>
   ctx.reply('Hey there'))
bot.hears('Hey', (ctx) =>
   ctx.reply('Hey there'))
bot.hears('source', (ctx) =>
   ctx.reply(`GitHub:`, Extra.HTML().markup((m) =>
   m.inlineKeyboard([
      m.urlButton('Source', 'https://github.com/trusty-code/tipbot-telegram'),
   ]))))

bot.launch()
