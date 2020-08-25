process.env["NTBA_FIX_319"] = 1;


const TelegramBot = require('node-telegram-bot-api');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Iota = require('@iota/core');
const Telegraf = require('telegraf');
const trustify = require('@trustify/tipbot.ts');
var TinyURL = require('tinyurl');

const bot = new Telegraf('bot-token-here')
 

bot.start((ctx) => 
   ctx.reply('Hi! I´m the IOTA TipBot Trustify! \r\nType /help to see a list of available commands. First you ned to set a valid donation adress with /add.'))

bot.help((ctx) => 
   ctx.reply('/help - some useful tips to this bot \r\n/add - set your IOTA receiving address \r\n/tip - tip to a User'))

//Not ready yet
bot.command('add', (ctx) => {
   ctx.reply('Enter a valid IOTA adress to receive your tips:')
       bot.on('message', (ctx) => {
          if ('message'){
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
      if(response) {
         ctx.reply(`<b>Tip to ${ctx.message.from.first_name}:</b>`, Extra.HTML().markup((m) =>
           m.inlineKeyboard([
              m.callbackButton('Address', 'Address'),
           m.callbackButton('QRCode', 'Pepsi'),
           m.urlButton('Trinity', 'http://telegraf.js.org'),
           
            ])))
         +
         ctx.reply(`${response}`)
         +
         ctx.replyWithPhoto(`https://api.qrserver.com/v1/create-qr-code/?data=${response}%0A&size=220x220&margin=0`)
         +
         TinyURL.shorten(`iota://${response}/$amout=1&message=Trustify_tip`).then(function(res) {
         ctx.reply(res)
          }, function(err) {
             ctx.reply(err)
          })
      } else {
         ctx.reply("I haven´t an address for this user.")
      }
   })
})
 
 bot.action(/.+/, (ctx) => {
   return ctx.answerCbQuery(`Adress copied to clipboard! ${ctx.match[0]}`)
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
