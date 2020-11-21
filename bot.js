process.env["NTBA_FIX_319"] = 1;
require('dotenv').config()

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Iota = require('@iota/core');
const Telegraf = require('telegraf');
const trustify = require('@trustify/tipbot.ts');
var TinyURL = require('tinyurl');


const BOT_TOKEN = process.env.BOT_TOKEN
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_URL = process.env.DB_URL
const DB_PORT = process.env.DB_PORT
const DB_NAME = process.env.DB_NAME


const bot = new Telegraf(BOT_TOKEN)
trustify.setDB(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_URL}:${DB_PORT}/${DB_NAME}`)


bot.start((ctx) =>
   ctx.reply('Hi! I´m the IOTA TipBot Trustify! \r\nType /help to see a list of available commands. First you ned to set a valid donation adress with /add.'))

bot.help((ctx) =>
   ctx.reply('/help - some useful tips to this bot \r\n/add - set your IOTA receiving address \r\n/tip - tip to a User'))

//Not ready yet
bot.command('add', (ctx) => {
   ctx.reply('Enter a valid IOTA adress to receive your tips:')
   bot.on('message', (ctx) => {
      if ('message') {
         let user = ctx.message.from.id
         let address = ctx.message.text
         let response = trustify.add(user, address)
         return ctx.reply(response)
      }

      else ('message')
      return ctx.reply('invalid IOTA Adress, please try Again!')

   })
})

bot.command('tip', async (ctx) => {
   let user = ctx.message.from.id
   trustify.tip(user).then((response) => {
      console.log("ctx.message.from", ctx.message.from)
      if (response) {

         TinyURL.shorten(`iota://${response}/$amout=1&message=Trustify_tip`).then(function (res) {
            // ctx.reply(res)

            ctx.reply(`<b>Tip to ${ctx.message.from.first_name}:</b>`, Extra.HTML().markup((m) =>
            m.inlineKeyboard([
               m.callbackButton('Copy Address', 'copy_address'),
               m.callbackButton('Shop QR Code', 'send_qr_code'),
               m.urlButton('Trinity', res),

            ])))

         // ctx.reply(`${response}`)

         }, function (err) {
            ctx.reply(err)
         })
       
         // ctx.replyWithPhoto(`https://api.qrserver.com/v1/create-qr-code/?data=${response}%0A&size=142x142&margin=0`)

         
      } else {
         ctx.reply("I haven´t an address for this user.")
      }
   })
})

// bot.action(/.+/, (ctx) => {
//    return ctx.answerCbQuery(`Adress copied to clipboard! ${ctx.match[0]}`)
// })

bot.action("copy_address", (ctx) => {
   console.log("Address copied")
   return ctx.answerCbQuery(`Address copied!`)
})
bot.action("send_qr_code", (ctx) => {
   console.log("send_qr_code")

   ctx.replyWithPhoto(`https://api.qrserver.com/v1/create-qr-code/?data=${"response"}%0A&size=142x142&margin=0`)
   
   return ctx.answerCbQuery(`send_qr_code`)
})




bot.on('sticker', (ctx) =>
   ctx.reply('👍'))


//Greetings/////////////////

bot.hears('hi', (ctx) =>
   ctx.reply('Hey there'))
bot.hears('Hi', (ctx) =>
   ctx.reply('Hey there'))
bot.hears('Hey', (ctx) =>
   ctx.reply('Hey there'))

bot.launch()
