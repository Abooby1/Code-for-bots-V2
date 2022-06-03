const {Client} = require('photop-client')

const client = new Client({username: 'Abicam_Engine', password: process.env['Pass']})

const JSONdb = require('simple-json-db')
const db = new JSONdb('storage.json')//make sure to make a file called "storage.json"

const START = '' //the thing someone has to post to connect the bot
const STARTTEXT = '' //the chat the bot sends when someone connects a post
const TIME = 0 //the time (in milliseconds) that the post is connected until disconnected because of inactivity
const PREFIX = ''//the prefix of the bot (no spaces)
const WrongCommand = ''//the text when someone does a command that does not exist

function getCom (c) {//all the commands
  switch (c) {
    case 'test'://command name
      return {
        name: 'test',//name of the command (again so it doesnt repeat the command name instead of the body)
        func: ({ chat, body, args: [h], data }) => {//add either chat, client, data, args, or body
          chat.reply(`hi ${body} ${h}... ${data.lvl}`)//code for the command
        }
      }
  }
}

const Version = 1//the version of the data (to update data)

const defaultData = {//the data that a new user gets
  version: 1
}

async function VersionUpdate (uid) {//for updating data (for users that have already used the bot)
  const d = JSON.parse(await db.get(uid))
  switch (d.version) {
    case 1://the version before the data update
      d.lvl = 1
      db.set(uid, JSON.stringify(d))
      break;
  }
}

//dont touch anything under this command (unless you know what your doing)
client.onPost = async (post) => {
  if (post.text == START) {
    setTimeout(function( ) {
      post.chat(STARTTEXT)
    }, 2500)
    const resettime = await post.connect(TIME, () => {
      post.onChat = noop; //replace post.onChat to free up memory
      if (post.text == START) {
        post.chat("Bot has disconnected... Reason: inactivity")
      }
    })
    resettime()
    post.onChat = async (chat) => {
      resettime()
      if (chat.text.toLowerCase().startsWith(PREFIX)) {
        const match = chat.text.substring(PREFIX.length).match(/([a-z0-9\.]+)(.*)/i);
        if (match) {
          const [_, commandname,  _body] = match;
          const body = _body.trim()
          const args = body.split(/\s+/);
          const context = { client, chat, body, args }
          if (db.get(chat.author.id) != undefined) {
            context.data = JSON.parse(await db.get(chat.author.id))
            if (context.data.version != Version) {
              VersionUpdate(chat.author.id)
            }
          } else {
            db.set(chat.author.id, JSON.stringify(defaultData))
            context.data = defaultData
          }
          setTimeout(async function( ) {
            if (getCom(commandname) != undefined) {
              getCom(commandname).func(context)
            } else {
              chat.reply(WrongCommand)
            }
          }, 100)
        } else {
          chat.reply(`Bad syntax...`)
        }
      }
    }
  }
}

client.onReady = () => {
  if (START == undefined || START == '') {
    throw new Error(`Your 'START' variable cant be empty...`)
  }
  if (STARTTEXT == undefined || STARTTEXT == '') {
    throw new Error(`Your 'STARTTEXT' variable cant be empty...`)
  }
  if (PREFIX == undefined || PREFIX == '') {
    throw new Error(`Your 'PREFIX' variable cant be empty...`)
  }
  if (TIME == undefined || TIME == '' || TIME < 30000) {
    throw new Error(`Your 'TIME' variable cant be less than 30000 milliseconds...`)
  }
  if (WrongCommand == undefined || WrongCommand == '') {
    throw new Error(`Your 'WrongCommand' variable cant be empty...`)
  }

  console.log(`Bot is ready!`)
}