//Setting up the bot
const discord = require('discord.js');
const bot = new discord.Client();
const token = 'NjA2NTgzMzIzNzk5NTg0Nzkz.XVYC5A.rqxknehOnZVltts1r3yDRlFUSt8';
bot.login(token);

//What triggers commands
const prefix = '!';
//This is used to fix the bot from counting a reaction twice if it was on the most recent message
let boolean = false;
//This is used to prevent the same message from being moved to the cool channel twice
let mapOfCoolMessages = new Map;

//Says when the bot is online and sets activity to 'Watching justice be delivered'
bot.on('ready', () => {
    console.log('Judge is online!');
    console.log('------------------------------------------------------------------');
    bot.user.setActivity('over you carefully', {
        type: 'WATCHING'
    })
    .catch(console.error)
});

//Sets up the json file which is accessed with 'peopleData[user ID] = score'
const fs = require('fs'); 
let peopleContents = fs.readFileSync('./peopleData.json'); 
let peopleData = peopleContents ? JSON.parse(peopleContents) : {}; 

let peopleContents2 = fs.readFileSync('./peopleData2.json'); 
let peopleData2 = peopleContents2 ? JSON.parse(peopleContents2) : {}; 

let peopleContents3 = fs.readFileSync('./peopleData3.json'); 
let peopleData3 = peopleContents3 ? JSON.parse(peopleContents3) : {}; 

//Trigger on ANY event, the only way to get reactions on older messages
bot.on('raw', event => {
    //Event.t is the 'group' of event info needed for this
    const eventName = event.t;

    //MESSAGE_REACTION_ADD is an event that can happen
    if (eventName === 'MESSAGE_REACTION_ADD') {
        //Gets the channel in question
        let reactionChannel = bot.channels.get(event.d.channel_id);
        //Deals with message in question
        reactionChannel.fetchMessage(event.d.message_id)
        .then(msg => {
            //Gets the reaction in question
            let msgReaction = msg.reactions.get(event.d.emoji.name + ':' + event.d.emoji.id);

            //Method one doesn't always work, if that's the case, use method two
            if (!msgReaction) {
                const emoji = new discord.Emoji(bot.guilds.get(event.d.guild_id), event.d.emoji);
                msgReaction = new discord.MessageReaction(msg, emoji, 1, event.d.user_id === bot.user.id);
            }

            //User who did the reaction
            let user = bot.users.get(event.d.user_id);
            //Number of X emoji on the message
            let neatCount = msg.reactions.filter(a => a.emoji.id == '609924102068764672').map(reaction => reaction.count)[0];
            let funnyCount = msg.reactions.filter(a => a.emoji.id == '609924118053388310').map(reaction => reaction.count)[0];
            let helpfulCount = msg.reactions.filter(a => a.emoji.id == '609924085379629057').map(reaction => reaction.count)[0];
            //Used to sort out duplicate messages
            let repeatNeatMessage = false;

            //If this message is already in the 'I have had X reactions map', flag it as a repeat
            if (mapOfCoolMessages.has(msg.id)) {
                repeatNeatMessage = true;
                console.log('This message has already been sent!.');
                console.log('------------------------------------------------------------------')
            }
            
            //Once a message reaches X put it in the 'I have had X map' as long as it is not a repeat
            //Currently moves to cool-stuff channel after 1 reaction
            if (neatCount >= 2 && !repeatNeatMessage) {
                mapOfCoolMessages.set(msg.id, neatCount);
                let myAttachments = msg.attachments;
                let messageSent = false;

                for (let key of myAttachments.keys()) {
                    let value = myAttachments.get(key).url;
                    bot.channels.get('609925203803242539').send(value + '\n' + 'Cool image by: ' + msgReaction.message.author.username);
                    messageSent = true;
                }

                if (!messageSent) {
                    bot.channels.get('609925203803242539').send(msgReaction.message.content + '\n' + 'Cool message by: ' + msgReaction.message.author.username);
                }

                console.log("I'm going to move this to neat-stuff.");
                console.log('------------------------------------------------------------------')
            }

            //This makes sure a reaction doesn't get counted twice
            //It is an edge case where the reaction detection method goes off twice if the message is the most recent
            boolean = true;
            bot.emit('messageReactionAdd', msgReaction, user);
        })
        .catch(err => console.log(err ));

    //MESSAGE_REACTION_REMOVE is an event that can happen
    } else if (eventName === 'MESSAGE_REACTION_REMOVE') {
        //Gets the channel in question
        let reactionChannel = bot.channels.get(event.d.channel_id);
        //Deals with message in question
        reactionChannel.fetchMessage(event.d.message_id)
        .then(msg => {
            //Gets the reaction in question
            let msgReaction = msg.reactions.get(event.d.emoji.name + ':' + event.d.emoji.id);

            //Method one doesn't always work, if that's the case, use method two
            if (!msgReaction) {
                const emoji = new discord.Emoji(bot.guilds.get(event.d.guild_id), event.d.emoji);
                msgReaction = new discord.MessageReaction(msg, emoji, 1, event.d.user_id === bot.user.id);
            }

            //If the message removed was X
            if (msgReaction.emoji.id === '609924102068764672') {
                //Get the reaction author, message author, and the score of the message author
                let reactionAuthor = bot.users.get(event.d.user_id);
                let messageAuthor = msgReaction.message.author.id;
                let scoreMsgAuthor = peopleData[messageAuthor];

                //If you aren't doing this to your own message
                if (reactionAuthor.id != messageAuthor) {
                    //Convert to an int, from a string
                    scoreMsgAuthor = parseInt(scoreMsgAuthor);
                    //Subtract one from score, because a reaction was removed
                    peopleData[messageAuthor] = (scoreMsgAuthor - 1);
                    console.log('I took away a neat point from, ' + messageAuthor + ' their new score = ' + (scoreMsgAuthor - 1));
                    console.log('------------------------------------------------------------------')
                }
            
                //Save it in the JSON
                fs.writeFile('./peopleData.json', JSON.stringify(peopleData), (err) => {
                    if (err) console.error(err); 
                }); 
            }

            if (msgReaction.emoji.id === '609924118053388310') {
                //Get the reaction author, message author, and the score of the message author
                let reactionAuthor = bot.users.get(event.d.user_id);
                let messageAuthor = msgReaction.message.author.id;
                let scoreMsgAuthor = peopleData2[messageAuthor];

                //If you aren't doing this to your own message
                if (reactionAuthor.id != messageAuthor) {
                    //Convert to an int, from a string
                    scoreMsgAuthor = parseInt(scoreMsgAuthor);
                    //Subtract one from score, because a reaction was removed
                    peopleData2[messageAuthor] = (scoreMsgAuthor - 1);
                    console.log('I took away a funny point from, ' + messageAuthor + ' their new score = ' + (scoreMsgAuthor - 1));
                    console.log('------------------------------------------------------------------')
                }
            
                //Save it in the JSON
                fs.writeFile('./peopleData2.json', JSON.stringify(peopleData2), (err) => {
                    if (err) console.error(err); 
                }); 
            }

            if (msgReaction.emoji.id === '609924085379629057') {
                //Get the reaction author, message author, and the score of the message author
                let reactionAuthor = bot.users.get(event.d.user_id);
                let messageAuthor = msgReaction.message.author.id;
                let scoreMsgAuthor = peopleData3[messageAuthor];

                //If you aren't doing this to your own message
                if (reactionAuthor.id != messageAuthor) {
                    //Convert to an int, from a string
                    scoreMsgAuthor = parseInt(scoreMsgAuthor);
                    //Subtract one from score, because a reaction was removed
                    peopleData3[messageAuthor] = (scoreMsgAuthor - 1);
                    console.log('I took away a helpful point from, ' + messageAuthor + ' their new score = ' + (scoreMsgAuthor - 1));
                    console.log('------------------------------------------------------------------')
                }
            
                //Save it in the JSON
                fs.writeFile('./peopleData.json3', JSON.stringify(peopleData3), (err) => {
                    if (err) console.error(err); 
                }); 
            }
        });
    }
});

//This detects reactions on the most recent message, the cause of that edge case
//I'm forcing it to work on any message with the bot.emit above
bot.on('messageReactionAdd', (messageReaction, user) => {
    //Get the emoji name, reaction author, and the message author
    const reactedName = messageReaction.emoji.id;
    const reactionAuthor = user.id;
    const messageAuthor = messageReaction.message.author.id;

    //If it is emoji X, and you are not doing this to your own message, and you have delt with the edge case
    if (reactedName === '609924102068764672' && reactionAuthor != messageAuthor && boolean == true) {
        //If the person never had a score, start them out at 1
        if (!peopleData[messageAuthor]) {
            peopleData[messageAuthor] = 1;
            console.log('This person didnt have any neat points before!');
        //If the person did have a score, add 1 to it
        } else {
            let score = peopleData[messageAuthor];
            peopleData[messageAuthor] = score + 1;
            console.log(messageAuthor + 's new neat score is: ' + peopleData[messageAuthor]);
            console.log('------------------------------------------------------------------');
        }

        //Save it in the JSON
        fs.writeFile('./peopleData.json', JSON.stringify(peopleData), (err) => {
            if (err) console.error(err); 
        });        
    }

    //If it is emoji X, and you are not doing this to your own message, and you have delt with the edge case
    if (reactedName === '609924118053388310' && reactionAuthor != messageAuthor && boolean == true) {
        //If the person never had a score, start them out at 1
        if (!peopleData2[messageAuthor]) {
            peopleData2[messageAuthor] = 1;
            console.log('This person didnt have any funny points before!');
        //If the person did have a score, add 1 to it
        } else {
            let score = peopleData2[messageAuthor];
            peopleData2[messageAuthor] = score + 1;
            console.log(messageAuthor + 's new funny score is: ' + peopleData2[messageAuthor]);
            console.log('------------------------------------------------------------------');
        }

        //Save it in the JSON
        fs.writeFile('./peopleData2.json', JSON.stringify(peopleData2), (err) => {
            if (err) console.error(err); 
        });        
    }

    //If it is emoji X, and you are not doing this to your own message, and you have delt with the edge case
    if (reactedName === '609924085379629057' && reactionAuthor != messageAuthor && boolean == true) {
        //If the person never had a score, start them out at 1
        if (!peopleData3[messageAuthor]) {
            peopleData3[messageAuthor] = 1;
            console.log('This person didnt have any helpful points before!');
        //If the person did have a score, add 1 to it
        } else {
            let score = peopleData3[messageAuthor];
            peopleData3[messageAuthor] = score + 1;
            console.log(messageAuthor + 's new helpful score is: ' + peopleData3[messageAuthor]);
            console.log('------------------------------------------------------------------');
        }

        //Save it in the JSON
        fs.writeFile('./peopleData3.json', JSON.stringify(peopleData3), (err) => {
            if (err) console.error(err); 
        });        
    }

    //Set the edge case boolean back to false
    boolean = false;
});

//This is what you interact with in the chat
//It goes off anytime there is a message
bot.on('message', message => {
    //Break the message up into words if it started with the prefix (!)
    let args = message.content.substring(prefix.length).split(' ');
    //Get the message author's username
    let thisUser = message.author.username;
    //Get the message author's ID
    let userID = message.author.id;
    //Read the current state of the JSON
    //Convert it into an object
    peopleContents = fs.readFileSync('./peopleData.json');
    let userData = JSON.parse(peopleContents);

    peopleContents2 = fs.readFileSync('./peopleData2.json');
    let userData2 = JSON.parse(peopleContents2);

    peopleContents3 = fs.readFileSync('./peopleData3.json');
    let userData3 = JSON.parse(peopleContents3);

    let allScores = [];
    let sortedNames = [];
    let foundTargetUserID;
    let foundTargetUser;

    //If the first word in the message is X
    switch(args [0]) {
        //!score creates an embed with the user's name and score
        case 'neatscore':
            let neatScoreKeys = Object.keys(userData);

            if (args[1]) {
                for (let i = 0; i < neatScoreKeys.length; i++) {
                    let targetUser = bot.users.get(neatScoreKeys[i]).username;
                    if (args[1] == targetUser) {
                        foundTargetUser = targetUser;
                        foundTargetUserID = bot.users.get(neatScoreKeys[i]).id;
                    }
                }
            } else {
                foundTargetUser = thisUser;
                foundTargetUserID = userID;
            }

            let neatScoreEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('Player Name', foundTargetUser)
            .addField('Neat Score', peopleData[foundTargetUserID])
            message.channel.send(neatScoreEmbed);
        break;

        case 'funnyscore':
            let funnyScoreKeys = Object.keys(userData2);

            if (args[1]) {
                for (let i = 0; i < funnyScoreKeys.length; i++) {
                    let targetUser = bot.users.get(funnyScoreKeys[i]).username;
                    if (args[1] == targetUser) {
                        foundTargetUser = targetUser;
                        foundTargetUserID = bot.users.get(funnyScoreKeys[i]).id;
                    }
                }
            } else {
                foundTargetUser = thisUser;
                foundTargetUserID = userID;
            }

            let funnyScoreEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('Player Name', foundTargetUser)
            .addField('Funny Score', peopleData2[foundTargetUserID])
            message.channel.send(funnyScoreEmbed);
        break;

        case 'helpfulscore':
            let helpfulScoreKeys = Object.keys(userData3);

            if (args[1]) {
                for (let i = 0; i < helpfulScoreKeys.length; i++) {
                    let targetUser = bot.users.get(helpfulScoreKeys[i]).username;
                    if (args[1] == targetUser) {
                        foundTargetUser = targetUser;
                        foundTargetUserID = bot.users.get(helpfulScoreKeys[i]).id;
                    }
                }
            } else {
                foundTargetUser = thisUser;
                foundTargetUserID = userID;
            }

            let helpfulScoreEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('Player Name', foundTargetUser)
            .addField('Helpful Score', peopleData3[foundTargetUserID])
            message.channel.send(helpfulScoreEmbed);
        break;

        //!leader creates an embed with the top 3 users and their respective scores
        case 'neatleader':
            let keys1 = Object.keys(userData);
            console.log('I displayed a leaderboard');

            //Get all of the scores
            for (let i = 0; i < keys1.length; i++) {
                allScores.push(userData[keys1[i]]);
            }

            //Sort all of the scores
            allScores.sort(function(a, b) {return b - a});

            //Associate the user with their score
            for (let i = 0; i < keys1.length; i++) {
                let currentScore = allScores[i];

                for (let i = 0; i < keys1.length; i++) {
                    if (currentScore == userData[keys1[i]]) {
                        sortedNames.push(bot.users.get(keys1[i]).username);
                    }
                }
            }

            let neatLeaderEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('First Place', sortedNames[0] + ' - ' + allScores[0])
            .addField('Second Place', sortedNames[1] + ' - ' + allScores[1])
            .addField('Third Place', sortedNames[2] + ' - ' + allScores[2])
            message.channel.send(neatLeaderEmbed);
        break;

        case 'funnyleader':
            let keys2 = Object.keys(userData2);
            console.log('I displayed a leaderboard');

            //Get all of the scores
            for (let i = 0; i < keys2.length; i++) {
                allScores.push(userData2[keys2[i]]);
            }

            //Sort all of the scores
            allScores.sort(function(a, b) {return b - a});

            //Associate the user with their score
            for (let i = 0; i < keys2.length; i++) {
                let currentScore = allScores[i];

                for (let i = 0; i < keys2.length; i++) {
                    if (currentScore == userData2[keys2[i]]) {
                        sortedNames.push(bot.users.get(keys2[i]).username);
                    }
                }
            }

            let funnyLeaderEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('First Place', sortedNames[0] + ' - ' + allScores[0])
            .addField('Second Place', sortedNames[1] + ' - ' + allScores[1])
            .addField('Third Place', sortedNames[2] + ' - ' + allScores[2])
            message.channel.send(funnyLeaderEmbed);
        break;

        case 'helpfulleader':
            let keys3 = Object.keys(userData3);
            console.log('I displayed a leaderboard');

            //Get all of the scores
            for (let i = 0; i < keys3.length; i++) {
                allScores.push(userData3[keys3[i]]);
            }

            //Sort all of the scores
            allScores.sort(function(a, b) {return b - a});

            //Associate the user with their score
            for (let i = 0; i < keys3.length; i++) {
                let currentScore = allScores[i];

                for (let i = 0; i < keys3.length; i++) {
                    if (currentScore == userData3[keys3[i]]) {
                        sortedNames.push(bot.users.get(keys3[i]).username);
                    }
                }
            }

            let helpfulLeaderEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .addField('First Place', sortedNames[0] + ' - ' + allScores[0])
            .addField('Second Place', sortedNames[1] + ' - ' + allScores[1])
            .addField('Third Place', sortedNames[2] + ' - ' + allScores[2])
            message.channel.send(helpfulLeaderEmbed);
        break;

        case 'help': 
            let helpEmbed = new discord.RichEmbed()
            .setColor(0x48C980)
            .setTitle('THESE ARE YOUR COMMANDS')
            .addField('Get your neat/funny/helpful score', '!neat/funny/helpful + score')
            .addField('Get your own score', '!neat/funny/helpful [leave rest blank]')
            message.channel.send(helpEmbed); 
        break;
    }
});