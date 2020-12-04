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

const addaddr = `Address added.`
const invalidaddr = `Error - Probably not a valid IOTA address`
const notfound = `User not found!`

trustify.setDB(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_URL}:${DB_PORT}/${DB_NAME}`)


bot.start((ctx) =>
   ctx.reply('Hi! I\'m the IOTA TipBot! \r\nType /help to see a list of available commands. First, you need to set a valid donation address with /add <your address>.'))

bot.help((ctx) =>
   ctx.reply('/start - to start using the bot and receive qr-codes \r\n/help - some useful tips to this bot \r\n/add - set your IOTA receiving address \r\n/tip - tip to a User'))

bot.hears(/^!del|^\/del/i, async (ctx) => {
   let msg = ctx.message.text
   if (msg === `!del`|| msg === `/del`) {
      var user = ctx.message.from.username
      let response = await trustify.del(user)
      if (response !== notfound) {
         ctx.reply(response)
      } else {
         ctx.reply('User @' + user + ' not found!')
      }
   } else {
      ctx.reply('Please only write /del to remove your tip account!')
   }
})

bot.hears(/^!add|^\/add/i, async (ctx) => {
   let user = ctx.message.from.username
   let address = ctx.message.text.slice(5)
   let response = trustify.add(user, address)
   if (response !== invalidaddr) {
        if (response !== addaddr) {
            ctx.reply(response)
        } else {
            ctx.reply(`${user} successfully added a new IOTA address!`)
        }
   } else {
     ctx.reply('Invalid IOTA address, please try again with:<pre>/add IOTAADDRESS</pre>',Extra.HTML())
   }
})

bot.hears(/^!tip|^\/tip/i, async (ctx) => {
   var checkreply = ctx.message.reply_to_message
   if (checkreply === undefined) {
      let getmsg = ctx.message.text
      let checkuser = getmsg.substring(5, 6)
      if(checkuser !== `@`) {
         ctx.reply("Please use the command as a reply or use /tip @username!")
         return
      } else {
         var user = getmsg.substring(6)
      }
   } else {
      var user = ctx.message.reply_to_message.from.username
   }

   if (user !== undefined) {
      trustify.tip(user).then((response) => {

         if (response) {

            let message = `<pre>` + response + `</pre>\n\nTip to: @${user}`

            TinyURL.shorten(`iota://${response}/?message=Tipped with Telegram @IOTA_TipBot`).then(function (res) {

               ctx.reply(message, Extra.HTML().markup((m) =>
               m.inlineKeyboard([
                  m.callbackButton('Show QR Code', 'send_qr_code'),

                  m.urlButton('Trinity', res),
               ])))

            }, function (err) {
               ctx.reply(err)
            })

         } else {
            ctx.reply(`@${user} does not have a IOTA tip address.`)
         }
      })
   } else if (checkreply !== undefined) {
      var firstname = ctx.message.reply_to_message.from.first_name
      ctx.reply(`${firstname} does not have a username.`)
   } else {
      ctx.reply(`Please use the tip command as a reply or tag a user.`)
   }
})

bot.action("send_qr_code", (ctx) => {

   let message = ctx.update.callback_query.message.text

   let address = message.substring(0, 90)
   let tip_text = message.substring(91, 99)
   let username = message.substring(100)

   let user_id = ctx.update.callback_query.from.id

   telegram.sendPhoto(user_id, `https://api.qrserver.com/v1/create-qr-code/?data=${address}`, {caption: `${tip_text} @${username}`}).then(res =>  {
      console.log("sendMessage", res)
   })

   return ctx.answerCbQuery(`Private message sent.`)
})


bot.command('source', (ctx) =>
   ctx.reply(`GitHub:`, Extra.HTML().markup((m) =>
   m.inlineKeyboard([
      m.urlButton('Source', 'https://github.com/trusty-code/tipbot-telegram'),
   ]))))

bot.launch()
